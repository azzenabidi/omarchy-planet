import os, sys, time
from pathlib import Path
from ctypes import CDLL

CDLL('libgtk4-layer-shell.so')

import gi
gi.require_version('Gtk', '4.0')
gi.require_version('WebKit', '6.0')
gi.require_version('Gtk4LayerShell', '1.0')
from gi.repository import Gtk, Gdk, WebKit, GLib
from gi.repository import Gtk4LayerShell as LayerShell

GAME_DIR = Path('/home/azzen/.config/omarchy/plugins/omarchy-planet/game')
STATE_FILE = Path("/tmp/omarchy-planet-state")
PID_FILE = Path("/tmp/omarchy-planet.pid")
TOGGLE_FILE = Path("/tmp/omarchy-planet-toggle")


class PlanetApp:
    def __init__(self):
        self.app = Gtk.Application(application_id='com.omarchy.planet.v2')
        self.app.connect('activate', self.on_activate)
        self.webview = None
        self.is_active = False
        self.last_toggle_mtime = 0

    def on_activate(self, app):
        print('ACTIVATED', flush=True)
        win = Gtk.ApplicationWindow(application=app)
        win.set_default_size(1920, 1080)
        win.set_decorated(False)

        LayerShell.init_for_window(win)
        LayerShell.set_layer(win, LayerShell.Layer.BACKGROUND)
        LayerShell.set_namespace(win, "omarchy-planet")
        LayerShell.set_keyboard_mode(win, LayerShell.KeyboardMode.NONE)

        for edge in [LayerShell.Edge.TOP, LayerShell.Edge.BOTTOM,
                     LayerShell.Edge.LEFT, LayerShell.Edge.RIGHT]:
            LayerShell.set_anchor(win, edge, True)

        self.webview = WebKit.WebView()
        self.webview.set_background_color(Gdk.RGBA(0, 0, 0, 0))
        self.webview.set_vexpand(True)
        self.webview.set_hexpand(True)

        url = f"file://{GAME_DIR}/index.html"
        print(f'Loading: {url}', flush=True)
        self.webview.load_uri(url)
        win.set_child(self.webview)

        ucm = self.webview.get_user_content_manager()
        ucm.register_script_message_handler("omarchy")
        self.webview.connect("user-message-received", self.on_js_message)

        PID_FILE.write_text(str(os.getpid()))
        STATE_FILE.write_text("inactive")

        GLib.timeout_add(200, self.check_toggle)
        print('Polling started', flush=True)

        win.present()
        print('WINDOW PRESENTED', flush=True)

    def check_toggle(self):
        if TOGGLE_FILE.exists():
            mtime = TOGGLE_FILE.stat().st_mtime_ns
            if mtime != self.last_toggle_mtime:
                self.last_toggle_mtime = mtime
                self.is_active = not self.is_active
                state = 'active' if self.is_active else 'inactive'
                STATE_FILE.write_text(state)
                print(f'TOGGLED to {state}', flush=True)
        return True

    def on_js_message(self, webview, message):
        params = message.get_parameters()
        if params:
            cmd = params.get_string()
            print(f'JS message: {cmd}', flush=True)
            if cmd == "open-settings":
                self.run_omarchy("monitor")
            elif cmd == "open-theme":
                self.run_omarchy("theme-switcher")
            elif cmd == "open-keyboard":
                self.run_omarchy("keyboard")
            elif cmd == "dismiss":
                self.is_active = not self.is_active
                STATE_FILE.write_text('active' if self.is_active else 'inactive')
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
        STATE_FILE.unlink(missing_ok=True)
        TOGGLE_FILE.unlink(missing_ok=True)


if __name__ == "__main__":
    PlanetApp().run()
