#!/usr/bin/env python3
"""Omarchy Planet - GTK4+WebKitGTK layer-shell container for the RPG game."""
import signal
import sys
from pathlib import Path
from ctypes import CDLL

# Load layer-shell before importing gi
CDLL('libgtk4-layer-shell.so')

import gi
gi.require_version('Gtk', '4.0')
gi.require_version('WebKit', '6.0')
gi.require_version('Gtk4LayerShell', '1.0')
from gi.repository import Gtk, Gdk, WebKit, GLib
from gi.repository import Gtk4LayerShell as LayerShell
import cairo

GAME_DIR = Path(__file__).parent / "game"
STATE_FILE = Path("/tmp/omarchy-planet-state")
PID_FILE = Path("/tmp/omarchy-planet.pid")


class PlanetApp:
    def __init__(self):
        self.app = Gtk.Application(application_id='com.omarchy.planet')
        self.app.connect('activate', self.on_activate)
        self.window = None
        self.webview = None
        self.is_active = False
        self.screens = []

    def on_activate(self, app):
        self.window = Gtk.ApplicationWindow(application=app)
        self.window.set_default_size(1920, 1080)
        self.window.set_decorated(False)

        # Layer shell setup - sits behind everything at wallpaper layer
        LayerShell.init_for_window(self.window)
        LayerShell.set_layer(self.window, LayerShell.Layer.BACKGROUND)
        LayerShell.set_namespace(self.window, "omarchy-planet")
        LayerShell.set_exclusive_zone(self.window, -1)

        # Anchor to all edges = fullscreen
        for edge in [LayerShell.Edge.TOP, LayerShell.Edge.BOTTOM,
                     LayerShell.Edge.LEFT, LayerShell.Edge.RIGHT]:
            LayerShell.set_anchor(self.window, edge, True)

        # Start transparent and click-through
        self.set_click_through(True)

        # WebKit web view for the Phaser game
        self.webview = WebKit.WebView()
        self.webview.set_background_color(Gdk.RGBA(0, 0, 0, 0))

        # Enable JavaScript message handlers
        settings = self.webview.get_settings()
        settings.set_enable_javascript(True)

        # Handle messages from JS
        manager = self.webview.get_user_content_manager()
        handler = WebKit.ScriptMessageHandler.new()
        manager.register_script_message_handler("omarchy", handler)
        handler.connect("received-message", self.on_js_message)

        # Load the game
        game_url = f"file://{GAME_DIR}/index.html"
        self.webview.load_uri(game_url)

        self.window.set_child(self.webview)

        # Write PID file
        PID_FILE.write_text(str(GLib.get_current_pid()))

        # Handle SIGUSR1 for toggle
        signal.signal(signal.SIGUSR1, lambda *_: self.toggle())

        # Set initial state as inactive
        STATE_FILE.write_text("inactive")

        self.window.present()

    def set_click_through(self, enabled):
        """Make window fully click-through or interactive."""
        if enabled:
            # Empty region = all clicks pass through
            region = cairo.Region(cairo.RectangleInt(0, 0, 0, 0))
            self.window.input_shape_combine_region(region)
        else:
            # Full region = window receives clicks
            self.window.set_child_input_region(None)

    def toggle(self):
        """Toggle between active (interactive) and inactive (click-through)."""
        self.is_active = not self.is_active

        if self.is_active:
            self.set_click_through(False)
            STATE_FILE.write_text("active")
            self.webview.run_javascript("window.onPlanetActivate && window.onPlanetActivate()")
        else:
            self.set_click_through(True)
            STATE_FILE.write_text("inactive")
            self.webview.run_javascript("window.onPlanetDeactivate && window.onPlanetDeactivate()")

    def on_js_message(self, manager, message):
        """Handle messages from the JS game."""
        body = message.get_arguments()
        if body is None:
            return

        args = []
        for i in range(body.get_n_items()):
            variant = body.get_child_value(i)
            args.append(variant.get_string())

        if not args:
            return

        cmd = args[0]

        if cmd == "open-settings":
            self.run_omarchy("monitor")
        elif cmd == "open-theme":
            self.run_omarchy("theme-switcher")
        elif cmd == "open-keyboard":
            self.run_omarchy("keyboard")
        elif cmd == "dismiss":
            self.toggle()

    def run_omarchy(self, panel_id):
        """Summon an Omarchy panel."""
        import subprocess
        subprocess.Popen(
            ["omarchy-shell", "shell", "summon", panel_id],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

    def cleanup(self):
        """Clean up state files."""
        PID_FILE.unlink(missing_ok=True)
        STATE_FILE.unlink(missing_ok=True)

    def run(self):
        self.app.connect('shutdown', lambda _: self.cleanup())
        self.app.run(sys.argv)


def main():
    app = PlanetApp()
    app.run()


if __name__ == "__main__":
    main()
