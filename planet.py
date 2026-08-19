#!/usr/bin/python3
"""Omarchy Planet - GTK4+WebKitGTK layer-shell container."""
import os
import sys
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
PID_FILE = Path("/tmp/omarchy-planet.pid")
VISIBLE_FILE = Path("/tmp/omarchy-planet-visible")


class PlanetApp:
    def __init__(self):
        self.app = Gtk.Application(application_id='com.omarchy.planet')
        self.app.connect('activate', self.on_activate)
        self.webview = None
        self.is_visible = False
        self.last_sig = ""

    def on_activate(self, app):
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
        self.webview.load_uri(url)
        win.set_child(self.webview)

        # JS bridge
        ucm = self.webview.get_user_content_manager()
        ucm.register_script_message_handler("omarchy")
        self.webview.connect("user-message-received", self.on_js_message)

        # Write PID
        PID_FILE.write_text(str(os.getpid()))

        # Start invisible
        VISIBLE_FILE.write_text("no")

        # Poll for toggle every 300ms
        GLib.timeout_add(300, self.poll)

        win.present()

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
            VISIBLE_FILE.write_text("yes")
            self.webview.run_javascript(
                "window.onPlanetActivate && window.onPlanetActivate()")
        else:
            VISIBLE_FILE.write_text("no")
            self.webview.run_javascript(
                "window.onPlanetDeactivate && window.onPlanetDeactivate()")

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
