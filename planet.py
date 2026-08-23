#!/usr/bin/python3
"""Omarchy Planet - GTK4+WebKitGTK layer-shell container."""
import json
import os
import subprocess
import sys
from pathlib import Path

import gi
gi.require_version('Gtk', '4.0')
gi.require_version('WebKit', '6.0')
gi.require_version('Gtk4LayerShell', '1.0')
from gi.repository import Gtk, Gdk, WebKit, GLib
from gi.repository import Gtk4LayerShell as LayerShell

GAME_DIR = Path(__file__).resolve().parent / "game"
PID_FILE = Path("/tmp/omarchy-planet.pid")
VISIBLE_FILE = Path("/tmp/omarchy-planet-visible")
DEBUG = bool(os.getenv("OMARCHY_PLANET_DEBUG"))

# Allowlisted actions the web game may trigger on the real desktop.
# Menus open via omarchy-menu routes, panels via omarchy-shell summon,
# everything else is a plain omarchy command.
MENU_ROUTES = {
    "menu-root": "root",
    "menu-apps": "apps",
    "menu-system": "system",
    "menu-theme": "style.theme",
    "menu-background": "style.background",
    "menu-about": "about",
}

PANEL_IDS = {
    "panel-audio": "omarchy.audio",
    "panel-network": "omarchy.network",
    "panel-bluetooth": "omarchy.bluetooth",
    "panel-power": "omarchy.power",
    "panel-monitor": "omarchy.monitor",
    "panel-clock": "omarchy.clock",
    "panel-weather": "omarchy.weather",
}

COMMANDS = {
    "terminal": ["omarchy-launch-terminal"],
    "screenshot": ["omarchy-capture-screenshot"],
    "clipboard-history": ["omarchy-clipboard-open"],
    "emoji-picker": ["omarchy-menu-emoji"],
    "keybindings": ["omarchy-menu-keybindings"],
    "background-next": ["omarchy-theme-bg-next"],
    "toggle-bar": ["omarchy-toggle-bar"],
    "toggle-nightlight": ["omarchy-toggle-nightlight"],
    "lock": ["omarchy-system-lock"],
}


def action_command(action):
    """Translate an action name into an argv list, or None if unknown."""
    if action in MENU_ROUTES:
        return ["omarchy-menu", "summon", MENU_ROUTES[action]]
    if action in PANEL_IDS:
        return ["omarchy-shell", "-q", "shell", "summon", PANEL_IDS[action]]
    if action in COMMANDS:
        return COMMANDS[action]
    if action.startswith("workspace-"):
        ws = action.split("-", 1)[1]
        if ws.isdigit():
            return ["hyprctl", "dispatch", "workspace", str(int(ws))]
    return None


def get_user_name():
    try:
        result = subprocess.run(
            ["git", "config", "--global", "user.name"],
            capture_output=True, text=True, timeout=5
        )
        name = result.stdout.strip()
        if name:
            return name
    except Exception:
        pass
    return os.getenv("USER", "Traveler")


class PlanetApp:
    def __init__(self):
        self.app = Gtk.Application(application_id='com.omarchy.planet')
        self.app.connect('activate', self.on_activate)
        self.window = None
        self.webview = None
        self.is_visible = False
        self.last_sig = ""

    def on_activate(self, app):
        self.window = Gtk.ApplicationWindow(application=app)
        self.window.set_default_size(1920, 1080)
        self.window.set_decorated(False)

        LayerShell.init_for_window(self.window)
        LayerShell.set_layer(self.window, LayerShell.Layer.BOTTOM)
        LayerShell.set_namespace(self.window, "omarchy-planet")

        for edge in [LayerShell.Edge.TOP, LayerShell.Edge.BOTTOM,
                     LayerShell.Edge.LEFT, LayerShell.Edge.RIGHT]:
            LayerShell.set_anchor(self.window, edge, True)

        self.webview = WebKit.WebView()
        self.webview.set_background_color(Gdk.RGBA(0, 0, 0, 0))
        self.webview.set_vexpand(True)
        self.webview.set_hexpand(True)

        url = f"file://{GAME_DIR}/index.html"
        self.webview.load_uri(url)
        self.window.set_child(self.webview)

        # Inject user name into page
        user_name = get_user_name()
        self.webview.connect("load-changed", lambda wv, event:
            self.on_page_loaded(wv, event, user_name))

        # JS bridge
        ucm = self.webview.get_user_content_manager()
        ucm.register_script_message_handler("omarchy")
        ucm.connect("script-message-received", self.on_js_message)

        # Write PID
        PID_FILE.write_text(str(os.getpid()))

        # Start visible (toggle hides it)
        VISIBLE_FILE.write_text("yes")

        # Poll for toggle every 300ms
        GLib.timeout_add(300, self.poll)

        self.window.present()

    def on_page_loaded(self, webview, event, user_name):
        # WebKit.LoadEvent.FINISHED = 4
        if event == 4:
            js = f"window.userName = {json.dumps(user_name)};"
            self.exec_js(js)

    def poll(self):
        if VISIBLE_FILE.exists():
            sig = VISIBLE_FILE.read_text().strip()
            if sig != self.last_sig:
                self.last_sig = sig
                self.toggle()
        return True

    def toggle(self):
        self.is_visible = not self.is_visible
        if self.is_visible:
            self.window.set_opacity(1.0)
            VISIBLE_FILE.write_text("yes")
            self.exec_js("window.onPlanetActivate && window.onPlanetActivate()")
        else:
            self.window.set_opacity(0.0)
            VISIBLE_FILE.write_text("no")
            self.exec_js("window.onPlanetDeactivate && window.onPlanetDeactivate()")

    def exec_js(self, js):
        self.webview.evaluate_javascript(
            js, -1, None, None, None, None, None
        )

    def on_js_message(self, manager, value):
        def dbg(msg):
            if DEBUG:
                with open("/tmp/omarchy-planet-debug.log", "a") as f:
                    f.write(msg + "\n")

        try:
            raw = value.to_string()
            dbg(f"MSG raw={raw!r}")
            payload = json.loads(raw)
            if isinstance(payload, str):
                payload = json.loads(payload)
        except Exception as e:
            dbg(f"PARSE-ERROR: {e!r}")
            return True
        cmd = payload.get("command")
        dbg(f"CMD={cmd}")
        try:
            if cmd == "run":
                self.run_action(payload.get("action", ""))
            elif cmd == "open-settings":
                self.run_action("panel-monitor")
            elif cmd == "open-theme":
                self.run_action("menu-theme")
            elif cmd == "open-keyboard":
                self.run_action("keybindings")
            elif cmd == "dismiss":
                self.toggle()
            elif cmd == "exit":
                self.app.quit()
        except Exception:
            import traceback
            dbg(f"HANDLER-ERROR: {traceback.format_exc()}")
        return True

    def run_action(self, action):
        argv = action_command(action)
        if DEBUG:
            with open("/tmp/omarchy-planet-debug.log", "a") as f:
                f.write(f"ACTION={action!r} argv={argv}\n")
        if not argv:
            print(f"Unknown action: {action}", flush=True)
            return
        subprocess.Popen(
            argv,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            start_new_session=True
        )

    def run(self):
        self.app.connect('shutdown', lambda _: self.cleanup())
        self.app.run(sys.argv)

    def cleanup(self):
        PID_FILE.unlink(missing_ok=True)
        VISIBLE_FILE.unlink(missing_ok=True)


if __name__ == "__main__":
    PlanetApp().run()
