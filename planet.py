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

GAME_DIR = Path('/home/azzen/.config/omarchy/plugins/omarchy-planet/game')
PID_FILE = Path("/tmp/omarchy-planet.pid")
VISIBLE_FILE = Path("/tmp/omarchy-planet-visible")


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
        LayerShell.set_layer(self.window, LayerShell.Layer.BACKGROUND)
        LayerShell.set_namespace(self.window, "omarchy-planet")
        LayerShell.set_keyboard_mode(self.window, LayerShell.KeyboardMode.NONE)

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
        self.webview.connect("user-message-received", self.on_js_message)

        # Write PID
        PID_FILE.write_text(str(os.getpid()))

        # Start hidden
        self.window.set_opacity(0.0)
        VISIBLE_FILE.write_text("no")

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

    def on_js_message(self, webview, message):
        params = message.get_parameters()
        if params:
            cmd = params.get_string()
            if cmd == "open-settings":
                self.run_omarchy("monitor")
            elif cmd == "open-theme":
                self.run_omarchy("theme-switcher")
            elif cmd == "open-keyboard":
                self.run_omarchy("keyboard")
            elif cmd == "dismiss":
                self.toggle()
            elif cmd == "exit":
                self.app.quit()
        return True

    def run_omarchy(self, panel_id):
        import subprocess
        subprocess.Popen(
            ["omarchy-shell", "shell", "summon", panel_id],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )

    def run(self):
        self.app.connect('shutdown', lambda _: self.cleanup())
        self.app.run(sys.argv)

    def cleanup(self):
        PID_FILE.unlink(missing_ok=True)
        VISIBLE_FILE.unlink(missing_ok=True)


if __name__ == "__main__":
    PlanetApp().run()
