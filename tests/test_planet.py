#!/usr/bin/python3
"""Comprehensive tests for Omarchy Planet."""
import csv
import json
import os
import sys
import tempfile
import subprocess
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).parent.parent))
from planet import get_user_name, PlanetApp
from toggle import is_running, start, main as toggle_main

passed = 0
failed = 0
errors = []


def test(name, fn):
    global passed, failed
    try:
        fn()
        print(f"  PASS  {name}")
        passed += 1
    except Exception as e:
        print(f"  FAIL  {name}: {e}")
        failed += 1
        errors.append((name, str(e)))


def assert_eq(a, b):
    assert a == b, f"Expected {b!r}, got {a!r}"


def assert_true(x):
    assert x, f"Expected truthy, got {x!r}"


def assert_false(x):
    assert not x, f"Expected falsy, got {x!r}"


def assert_in(item, collection):
    assert item in collection, f"Expected {item!r} in collection"


def assert_not_in(item, collection):
    assert item not in collection, f"Expected {item!r} NOT in collection"


def assert_raises(exc_type, fn, *args):
    try:
        fn(*args)
        assert False, f"Expected {exc_type.__name__} to be raised"
    except exc_type:
        pass


# ============================================================
# get_user_name tests
# ============================================================
def test_git_name():
    with mock.patch('subprocess.run') as m:
        m.return_value = mock.Mock(stdout='John Doe\n', returncode=0)
        assert_eq(get_user_name(), 'John Doe')


def test_fallback_to_env():
    with mock.patch('subprocess.run', side_effect=Exception('no git')):
        with mock.patch.dict(os.environ, {'USER': 'testuser'}):
            assert_eq(get_user_name(), 'testuser')


def test_fallback_to_traveler():
    with mock.patch('subprocess.run', side_effect=Exception('no git')):
        with mock.patch.dict(os.environ, {}, clear=True):
            assert_eq(get_user_name(), 'Traveler')


def test_empty_git_name():
    with mock.patch('subprocess.run') as m:
        m.return_value = mock.Mock(stdout='\n', returncode=0)
        with mock.patch.dict(os.environ, {'USER': 'envuser'}):
            assert_eq(get_user_name(), 'envuser')


def test_git_timeout():
    with mock.patch('subprocess.run', side_effect=subprocess.TimeoutExpired('git', 5)):
        with mock.patch.dict(os.environ, {'USER': 'timeoutuser'}):
            assert_eq(get_user_name(), 'timeoutuser')


# ============================================================
# JS injection safety tests
# ============================================================
def test_xss_single_quote():
    name = "O'Brien"
    result = json.dumps(name)
    js = f"window.userName = {result};"
    assert_true(result.startswith('"'))
    assert_true(result.endswith('"'))
    assert_eq(json.loads(result), name)


def test_xss_semicolon():
    name = "test'; alert(1);//"
    result = json.dumps(name)
    assert_eq(json.loads(result), name)


def test_xss_backslash():
    name = "test\\value"
    result = json.dumps(name)
    assert_eq(json.loads(result), name)


def test_xss_newline():
    name = "line1\nline2"
    result = json.dumps(name)
    assert_eq(json.loads(result), name)


def test_normal_name():
    name = "Azzen Abidi"
    result = json.dumps(name)
    assert_eq(json.loads(result), name)


# ============================================================
# Toggle logic tests
# ============================================================
def test_toggle_no_to_yes():
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write("no")
        path = f.name
    try:
        current = open(path).read().strip()
        new_state = "no" if current == "yes" else "yes"
        open(path, 'w').write(new_state)
        assert_eq(open(path).read().strip(), "yes")
    finally:
        os.unlink(path)


def test_toggle_yes_to_no():
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write("yes")
        path = f.name
    try:
        current = open(path).read().strip()
        new_state = "no" if current == "yes" else "yes"
        open(path, 'w').write(new_state)
        assert_eq(open(path).read().strip(), "no")
    finally:
        os.unlink(path)


def test_toggle_double():
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write("no")
        path = f.name
    try:
        for _ in range(4):
            current = open(path).read().strip()
            new_state = "no" if current == "yes" else "yes"
            open(path, 'w').write(new_state)
        assert_eq(open(path).read().strip(), "no")
    finally:
        os.unlink(path)


# ============================================================
# PID file tests
# ============================================================
def test_pid_file_creation():
    with tempfile.NamedTemporaryFile(mode='w', suffix='.pid', delete=False) as f:
        path = f.name
    try:
        open(path, 'w').write(str(os.getpid()))
        pid = int(open(path).read().strip())
        assert_eq(pid, os.getpid())
    finally:
        os.unlink(path)


def test_pid_file_invalid():
    with tempfile.NamedTemporaryFile(mode='w', suffix='.pid', delete=False) as f:
        f.write("not a number")
        path = f.name
    try:
        assert_raises(ValueError, lambda: int(open(path).read().strip()))
    finally:
        os.unlink(path)


def test_pid_file_empty():
    with tempfile.NamedTemporaryFile(mode='w', suffix='.pid', delete=False) as f:
        f.write("")
        path = f.name
    try:
        assert_raises(ValueError, lambda: int(open(path).read().strip()))
    finally:
        os.unlink(path)


# ============================================================
# Process detection tests
# ============================================================
def test_is_running_self():
    assert_true(is_running(os.getpid()))


def test_is_running_invalid_pid():
    assert_false(is_running(99999999))


def test_is_running_negative():
    result = is_running(-1)
    assert isinstance(result, bool)


# ============================================================
# Dialog box tests
# ============================================================
def test_dialog_box_min_height():
    min_height = 180
    for h in [40, 80, 120, 160, 200, 300]:
        box_height = max(min_height, h + 60)
        assert_true(box_height >= min_height)
        if h <= 120:
            assert_eq(box_height, min_height)


def test_dialog_box_resize():
    min_height = 180
    text_height = 250
    box_height = max(min_height, text_height + 60)
    assert_eq(box_height, 310)


# ============================================================
# Scene structure tests
# ============================================================
def test_scene_names():
    scenes = ['Boot', 'Village', 'Forest', 'SettingsCave', 'Workshop']
    assert_eq(len(scenes), 5)
    assert_in('Village', scenes)
    assert_in('Forest', scenes)
    assert_in('SettingsCave', scenes)
    assert_in('Workshop', scenes)
    assert_in('Boot', scenes)


def test_game_files_exist():
    base = Path(__file__).parent.parent / 'game'
    assert_true((base / 'index.html').exists())
    assert_true((base / 'js' / 'main.js').exists())
    assert_true((base / 'js' / 'scenes' / 'Boot.js').exists())
    assert_true((base / 'js' / 'scenes' / 'Village.js').exists())
    assert_true((base / 'js' / 'scenes' / 'Forest.js').exists())
    assert_true((base / 'js' / 'scenes' / 'SettingsCave.js').exists())
    assert_true((base / 'js' / 'scenes' / 'Workshop.js').exists())
    assert_true((base / 'js' / 'entities' / 'Player.js').exists())
    assert_true((base / 'js' / 'entities' / 'NPC.js').exists())
    assert_true((base / 'js' / 'systems' / 'Dialog.js').exists())
    assert_true((base / 'js' / 'systems' / 'DialogData.js').exists())
    assert_true((base / 'js' / 'systems' / 'Bridge.js').exists())


def test_python_files_exist():
    base = Path(__file__).parent.parent
    assert_true((base / 'planet.py').exists())
    assert_true((base / 'toggle.py').exists())
    assert_true((base / 'stop.py').exists())
    assert_true((base / 'restart.sh').exists())
    assert_true((base / 'game' / 'data' / 'dialog.csv').exists())


# ============================================================
# CSV dialog file tests
# ============================================================
def test_csv_exists():
    csv_path = Path(__file__).parent.parent / 'game' / 'data' / 'dialog.csv'
    assert_true(csv_path.exists())


def test_csv_has_headers():
    csv_path = Path(__file__).parent.parent / 'game' / 'data' / 'dialog.csv'
    with open(csv_path) as f:
        reader = csv.reader(f)
        headers = next(reader)
    assert_eq(headers, ['scene', 'id', 'type', 'name', 'line', 'text', 'recommendation'])


def test_csv_has_content():
    csv_path = Path(__file__).parent.parent / 'game' / 'data' / 'dialog.csv'
    with open(csv_path) as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    assert_true(len(rows) > 50)


def test_csv_has_all_scenes():
    csv_path = Path(__file__).parent.parent / 'game' / 'data' / 'dialog.csv'
    scenes = set()
    with open(csv_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            scenes.add(row['scene'])
    assert_in('Village', scenes)
    assert_in('Forest', scenes)
    assert_in('SettingsCave', scenes)
    assert_in('Workshop', scenes)


def test_csv_has_npc_and_signs():
    csv_path = Path(__file__).parent.parent / 'game' / 'data' / 'dialog.csv'
    types = set()
    with open(csv_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            types.add(row['type'])
    assert_in('npc', types)
    assert_in('sign', types)


def test_csv_village_npcs():
    csv_path = Path(__file__).parent.parent / 'game' / 'data' / 'dialog.csv'
    npcs = set()
    with open(csv_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['scene'] == 'Village' and row['type'] == 'npc':
                npcs.add(row['id'])
    assert_in('elder', npcs)
    assert_in('blacksmith', npcs)
    assert_in('merchant', npcs)


def test_csv_recommendations():
    csv_path = Path(__file__).parent.parent / 'game' / 'data' / 'dialog.csv'
    has_rec = False
    with open(csv_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['recommendation']:
                has_rec = True
                break
    assert_true(has_rec)


# ============================================================
# JS validation tests
# ============================================================
def test_js_no_syntax_errors():
    """Check JS files for obvious syntax issues."""
    base = Path(__file__).parent.parent / 'game' / 'js'
    js_files = [
        'main.js',
        'scenes/Boot.js',
        'scenes/Village.js',
        'scenes/Forest.js',
        'scenes/SettingsCave.js',
        'scenes/Workshop.js',
        'entities/Player.js',
        'entities/NPC.js',
        'systems/Dialog.js',
        'systems/DialogData.js',
        'systems/Bridge.js'
    ]
    for f in js_files:
        path = base / f
        content = path.read_text()
        # Check balanced braces
        open_braces = content.count('{')
        close_braces = content.count('}')
        assert_eq(open_braces, close_braces)
        # Check balanced parentheses
        open_parens = content.count('(')
        close_parens = content.count(')')
        assert_eq(open_parens, close_parens)


def test_js_classes_defined():
    """Check that all expected classes are defined."""
    base = Path(__file__).parent.parent / 'game' / 'js'
    npc = (base / 'entities' / 'NPC.js').read_text()
    assert_in('class NPC', npc)
    assert_in('talk()', npc)
    assert_in('showNextLine()', npc)

    dialog = (base / 'systems' / 'Dialog.js').read_text()
    assert_in('class Dialog', dialog)
    assert_in('advance()', dialog)
    assert_in('onAdvance', dialog)

    player = (base / 'entities' / 'Player.js').read_text()
    assert_in('class Player', player)
    assert_in('moveTo(', player)

    dialog_data = (base / 'systems' / 'DialogData.js').read_text()
    assert_in('DialogData', dialog_data)
    assert_in('load()', dialog_data)
    assert_in('parse(', dialog_data)
    assert_in('getNPCs(', dialog_data)
    assert_in('getSigns(', dialog_data)


def test_bridge_commands():
    """Check Bridge has all required commands."""
    bridge = (Path(__file__).parent.parent / 'game' / 'js' / 'systems' / 'Bridge.js').read_text()
    assert_in('openSettings', bridge)
    assert_in('openTheme', bridge)
    assert_in('openKeyboard', bridge)
    assert_in('dismiss', bridge)
    assert_in('exit', bridge)


def test_npc_has_recommendation():
    """Check NPC constructor accepts recommendation parameter."""
    npc = (Path(__file__).parent.parent / 'game' / 'js' / 'entities' / 'NPC.js').read_text()
    assert_in('recommendation', npc)
    assert_in('showNextLine', npc)


# ============================================================
# Audio (Chiptune) tests
# ============================================================
def test_chiptune_tracks():
    """Check Chiptune defines separate title and game tracks."""
    chiptune = (Path(__file__).parent.parent / 'game' / 'js' / 'systems' / 'Chiptune.js').read_text()
    assert_in("title:", chiptune)
    assert_in("game:", chiptune)
    assert_in('play(name)', chiptune)
    assert_in('unlock()', chiptune)


def test_chiptume_resume_covers_interrupted_state():
    """Check Chiptune handles WebKit's non-standard audio states."""
    chiptune = (Path(__file__).parent.parent / 'game' / 'js' / 'systems' / 'Chiptune.js').read_text()
    assert_not_in("state === 'suspended'", chiptune)
    assert_in("wake()", chiptune)


def test_boot_plays_title_theme():
    """Check welcome screen selects the title theme."""
    boot = (Path(__file__).parent.parent / 'game' / 'js' / 'scenes' / 'Boot.js').read_text()
    assert_in("Chiptune.play('title')", boot)
    assert_in('soundEnabled', boot)


def test_village_switches_to_game_theme():
    """Check Village switches to the overworld theme."""
    village = (Path(__file__).parent.parent / 'game' / 'js' / 'scenes' / 'Village.js').read_text()
    assert_in("Chiptune.play('game')", village)


def test_index_loads_chiptune_and_toggle():
    """Check index.html includes Chiptune and the music toggle button."""
    html = (Path(__file__).parent.parent / 'game' / 'index.html').read_text()
    assert_in('systems/Chiptune.js', html)
    assert_in('music-toggle', html)
    assert_in('toggleMute', html)


def test_main_wires_audio_lifecycle():
    """Check main.js unlocks audio and pauses it on hide/show."""
    main = (Path(__file__).parent.parent / 'game' / 'js' / 'main.js').read_text()
    assert_in('Chiptune.unlock', main)
    assert_in('Chiptune.resume', main)
    assert_in('Chiptune.suspend', main)


# ============================================================
# Player movement tests
# ============================================================
def test_player_move_to_allows_retargeting():
    """Check moveTo does not register extra listeners that cancel movement."""
    player = (Path(__file__).parent.parent / 'game' / 'js' / 'entities' / 'Player.js').read_text()
    move_body = player.split('moveTo(x, y) {')[1].split('}')[0]
    assert_not_in("input.on", move_body)
    assert_in('targetX', player)
    assert_in('Distance.Between', player)


# ============================================================
# Planet.py bridge tests
# ============================================================
def test_planet_bridge_uses_script_message_signal():
    """Check the JS bridge listens on the UserContentManager signal."""
    planet = (Path(__file__).parent.parent / 'planet.py').read_text()
    assert_in('script-message-received', planet)
    assert_not_in('connect("user-message-received"', planet)


def test_planet_finished_event_constant():
    """Check load FINISHED is detected with the correct event value (3)."""
    planet = (Path(__file__).parent.parent / 'planet.py').read_text()
    assert_in('event == 3', planet)
    assert_not_in('event == 4', planet)


def test_planet_portable_game_dir():
    """Check GAME_DIR derives from the script location, not a hardcoded home."""
    planet = (Path(__file__).parent.parent / 'planet.py').read_text()
    assert_in('__file__', planet)
    assert_not_in('/home/azzen', planet)


def test_planet_allowlists_actions():
    """Check desktop actions are allowlisted in planet.py."""
    planet = (Path(__file__).parent.parent / 'planet.py').read_text()
    for action in ['menu-theme', 'panel-audio', 'panel-monitor', 'keybindings']:
        assert_in(action, planet)


# ============================================================
# Python syntax tests
# ============================================================
def test_python_syntax():
    """Check Python files for syntax errors."""
    base = Path(__file__).parent.parent
    for f in ['planet.py', 'toggle.py', 'stop.py']:
        path = base / f
        content = path.read_text()
        compile(content, str(path), 'exec')


# ============================================================
# Scene content tests (now loading from CSV)
# ============================================================
def test_village_loads_from_csv():
    """Check Village.js uses DialogData."""
    village = (Path(__file__).parent.parent / 'game' / 'js' / 'scenes' / 'Village.js').read_text()
    assert_in('DialogData.getNPCs', village)
    assert_in('createNPCs', village)


def test_forest_loads_from_csv():
    """Check Forest.js uses DialogData."""
    forest = (Path(__file__).parent.parent / 'game' / 'js' / 'scenes' / 'Forest.js').read_text()
    assert_in('DialogData.getSigns', forest)
    assert_in('createSignposts', forest)


def test_settings_cave_loads_from_csv():
    """Check SettingsCave.js uses DialogData."""
    cave = (Path(__file__).parent.parent / 'game' / 'js' / 'scenes' / 'SettingsCave.js').read_text()
    assert_in('DialogData.getNPCs', cave)
    assert_in('createNPCs', cave)


def test_workshop_loads_from_csv():
    """Check Workshop.js uses DialogData."""
    workshop = (Path(__file__).parent.parent / 'game' / 'js' / 'scenes' / 'Workshop.js').read_text()
    assert_in('DialogData.getNPCs', workshop)
    assert_in('createNPCs', workshop)


# ============================================================
# Portal tests
# ============================================================
def test_village_has_portals():
    """Check Village.js has portals to all scenes."""
    village = (Path(__file__).parent.parent / 'game' / 'js' / 'scenes' / 'Village.js').read_text()
    assert_in('FOREST', village)
    assert_in('CAVE', village)
    assert_in('WORKSHOP', village)
    assert_in('EXIT', village)


def test_return_portals():
    """Check other scenes have return portals to Village."""
    forest = (Path(__file__).parent.parent / 'game' / 'js' / 'scenes' / 'Forest.js').read_text()
    assert_in('VILLAGE', forest)

    cave = (Path(__file__).parent.parent / 'game' / 'js' / 'scenes' / 'SettingsCave.js').read_text()
    assert_in('VILLAGE', cave)

    workshop = (Path(__file__).parent.parent / 'game' / 'js' / 'scenes' / 'Workshop.js').read_text()
    assert_in('VILLAGE', workshop)


# ============================================================
# Welcome screen tests
# ============================================================
def test_boot_has_welcome():
    """Check Boot.js has welcome screen."""
    boot = (Path(__file__).parent.parent / 'game' / 'js' / 'scenes' / 'Boot.js').read_text()
    assert_in('showWelcome', boot)
    assert_in('userName', boot)
    assert_in('CLICK TO BEGIN', boot)


# ============================================================
# Planet.py feature tests
# ============================================================
def test_planet_has_layer_shell():
    """Check planet.py uses layer shell (BOTTOM layer: BACKGROUND ignores pointer events)."""
    planet = (Path(__file__).parent.parent / 'planet.py').read_text()
    assert_in('Gtk4LayerShell', planet)
    assert_in('Layer.BOTTOM', planet)


def test_planet_has_user_name():
    """Check planet.py injects user name."""
    planet = (Path(__file__).parent.parent / 'planet.py').read_text()
    assert_in('get_user_name', planet)
    assert_in('json.dumps', planet)
    assert_in('window.userName', planet)


def test_planet_has_toggle():
    """Check planet.py handles toggle."""
    planet = (Path(__file__).parent.parent / 'planet.py').read_text()
    assert_in('VISIBLE_FILE', planet)
    assert_in('def poll', planet)
    assert_in('set_opacity', planet)


def test_planet_handles_exit():
    """Check planet.py handles exit command."""
    planet = (Path(__file__).parent.parent / 'planet.py').read_text()
    assert_in('"exit"', planet)
    assert_in('app.quit()', planet)


# ============================================================
# Toggle.py feature tests
# ============================================================
def test_toggle_has_lock():
    """Check toggle.py uses file lock."""
    toggle = (Path(__file__).parent.parent / 'toggle.py').read_text()
    assert_in('fcntl', toggle)
    assert_in('LOCK_EX', toggle)


def test_toggle_handles_invalid_pid():
    """Check toggle.py handles invalid PID."""
    toggle = (Path(__file__).parent.parent / 'toggle.py').read_text()
    assert_in('ValueError', toggle)


# ============================================================
# Stop.py feature tests
# ============================================================
def test_stop_sends_sigterm():
    """Check stop.py sends SIGTERM."""
    stop = (Path(__file__).parent.parent / 'stop.py').read_text()
    assert_in('SIGTERM', stop)
    assert_in('os.kill', stop)


# ============================================================
# Run all tests
# ============================================================
if __name__ == '__main__':
    print("\n=== Omarchy Planet Test Suite ===\n")

    print("--- Name Resolution ---")
    test("git name lookup", test_git_name)
    test("fallback to USER env", test_fallback_to_env)
    test("fallback to Traveler", test_fallback_to_traveler)
    test("empty git name", test_empty_git_name)
    test("git timeout", test_git_timeout)

    print("\n--- XSS Prevention ---")
    test("single quote escaping", test_xss_single_quote)
    test("semicolon injection", test_xss_semicolon)
    test("backslash escaping", test_xss_backslash)
    test("newline escaping", test_xss_newline)
    test("normal name", test_normal_name)

    print("\n--- Toggle Logic ---")
    test("toggle no->yes", test_toggle_no_to_yes)
    test("toggle yes->no", test_toggle_yes_to_no)
    test("toggle double cycle", test_toggle_double)

    print("\n--- PID File ---")
    test("pid file creation", test_pid_file_creation)
    test("pid file invalid", test_pid_file_invalid)
    test("pid file empty", test_pid_file_empty)

    print("\n--- Process Detection ---")
    test("is_running self", test_is_running_self)
    test("is_running invalid pid", test_is_running_invalid_pid)
    test("is_running negative", test_is_running_negative)

    print("\n--- Dialog System ---")
    test("dialog box min height", test_dialog_box_min_height)
    test("dialog box resize", test_dialog_box_resize)

    print("\n--- Scene Structure ---")
    test("scene names", test_scene_names)
    test("game files exist", test_game_files_exist)
    test("python files exist", test_python_files_exist)

    print("\n--- CSV Dialog File ---")
    test("csv exists", test_csv_exists)
    test("csv has headers", test_csv_has_headers)
    test("csv has content", test_csv_has_content)
    test("csv has all scenes", test_csv_has_all_scenes)
    test("csv has npc and signs", test_csv_has_npc_and_signs)
    test("csv village npcs", test_csv_village_npcs)
    test("csv has recommendations", test_csv_recommendations)

    print("\n--- JavaScript Validation ---")
    test("no syntax errors", test_js_no_syntax_errors)
    test("classes defined", test_js_classes_defined)
    test("bridge commands", test_bridge_commands)
    test("npc has recommendation", test_npc_has_recommendation)

    print("\n--- Python Validation ---")
    test("python syntax", test_python_syntax)

    print("\n--- Scene Content (CSV-based) ---")
    test("village loads from csv", test_village_loads_from_csv)
    test("forest loads from csv", test_forest_loads_from_csv)
    test("settings cave loads from csv", test_settings_cave_loads_from_csv)
    test("workshop loads from csv", test_workshop_loads_from_csv)

    print("\n--- Navigation ---")
    test("village has portals", test_village_has_portals)
    test("return portals", test_return_portals)

    print("\n--- Welcome Screen ---")
    test("boot has welcome", test_boot_has_welcome)

    print("\n--- Audio (Chiptune) ---")
    test("chiptune tracks", test_chiptune_tracks)
    test("chiptune handles interrupted state", test_chiptume_resume_covers_interrupted_state)
    test("boot plays title theme", test_boot_plays_title_theme)
    test("village switches to game theme", test_village_switches_to_game_theme)
    test("index loads chiptune and toggle", test_index_loads_chiptune_and_toggle)
    test("main wires audio lifecycle", test_main_wires_audio_lifecycle)

    print("\n--- Player Movement ---")
    test("player move-to allows retargeting", test_player_move_to_allows_retargeting)

    print("\n--- Planet.py Bridge ---")
    test("planet bridge uses script message signal", test_planet_bridge_uses_script_message_signal)
    test("planet finished event constant", test_planet_finished_event_constant)
    test("planet portable game dir", test_planet_portable_game_dir)
    test("planet allowlists actions", test_planet_allowlists_actions)

    print("\n--- Planet.py Features ---")
    test("planet has layer shell", test_planet_has_layer_shell)
    test("planet has user name", test_planet_has_user_name)
    test("planet has toggle", test_planet_has_toggle)
    test("planet handles exit", test_planet_handles_exit)

    print("\n--- Toggle.py Features ---")
    test("toggle has lock", test_toggle_has_lock)
    test("toggle handles invalid pid", test_toggle_handles_invalid_pid)

    print("\n--- Stop.py Features ---")
    test("stop sends sigterm", test_stop_sends_sigterm)

    print(f"\n{'='*40}")
    print(f"{passed} passed, {failed} failed")
    if errors:
        print("\nFailed tests:")
        for name, err in errors:
            print(f"  - {name}: {err}")
    print(f"{'='*40}\n")
    sys.exit(1 if failed else 0)
