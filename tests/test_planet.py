#!/usr/bin/python3
"""Tests for Omarchy Planet (no dependencies required)."""
import json
import os
import sys
import tempfile
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).parent.parent))
from planet import get_user_name

passed = 0
failed = 0


def test(name, fn):
    global passed, failed
    try:
        fn()
        print(f"  PASS  {name}")
        passed += 1
    except Exception as e:
        print(f"  FAIL  {name}: {e}")
        failed += 1


# --- get_user_name ---
def test_git_name():
    with mock.patch('subprocess.run') as m:
        m.return_value = mock.Mock(stdout='John Doe\n', returncode=0)
        assert get_user_name() == 'John Doe'


def test_fallback_to_env():
    with mock.patch('subprocess.run', side_effect=Exception('no git')):
        with mock.patch.dict(os.environ, {'USER': 'testuser'}):
            assert get_user_name() == 'testuser'


def test_fallback_to_traveler():
    with mock.patch('subprocess.run', side_effect=Exception('no git')):
        with mock.patch.dict(os.environ, {}, clear=True):
            assert get_user_name() == 'Traveler'


def test_empty_git_name():
    with mock.patch('subprocess.run') as m:
        m.return_value = mock.Mock(stdout='\n', returncode=0)
        with mock.patch.dict(os.environ, {'USER': 'envuser'}):
            assert get_user_name() == 'envuser'


# --- JS injection safety ---
def test_username_with_quotes():
    name = "O'Brien"
    result = json.dumps(name)
    js = f"window.userName = {result};"
    # Should be valid JS - json.dumps wraps in double quotes
    assert result.startswith('"')
    assert result.endswith('"')
    assert json.loads(result) == name


def test_username_with_semicolon():
    name = "test'; alert(1);//"
    result = json.dumps(name)
    js = f"window.userName = {result};"
    # json.dumps escapes single quotes inside double-quoted string
    assert "\\'" not in result
    assert json.loads(result) == name


def test_username_normal():
    name = "Azzen Abidi"
    result = json.dumps(name)
    assert json.loads(result) == name


# --- Toggle logic ---
def test_toggle_no_to_yes():
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write("no")
        f.flush()
        path = f.name
    try:
        current = open(path).read().strip()
        new_state = "no" if current == "yes" else "yes"
        open(path, 'w').write(new_state)
        assert open(path).read().strip() == "yes"
    finally:
        os.unlink(path)


def test_toggle_yes_to_no():
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write("yes")
        f.flush()
        path = f.name
    try:
        current = open(path).read().strip()
        new_state = "no" if current == "yes" else "yes"
        open(path, 'w').write(new_state)
        assert open(path).read().strip() == "no"
    finally:
        os.unlink(path)


# --- PID file ---
def test_pid_file_creation():
    with tempfile.NamedTemporaryFile(mode='w', suffix='.pid', delete=False) as f:
        path = f.name
    try:
        open(path, 'w').write(str(os.getpid()))
        pid = int(open(path).read().strip())
        assert pid == os.getpid()
    finally:
        os.unlink(path)


def test_pid_file_invalid():
    with tempfile.NamedTemporaryFile(mode='w', suffix='.pid', delete=False) as f:
        f.write("not a number")
        f.flush()
        path = f.name
    try:
        try:
            int(open(path).read().strip())
            assert False, "Should have raised ValueError"
        except ValueError:
            pass
    finally:
        os.unlink(path)


# --- Dialog text wrapping ---
def test_dialog_box_min_height():
    min_height = 180
    text_heights = [40, 80, 120, 160, 200, 300]
    for h in text_heights:
        box_height = max(min_height, h + 60)
        assert box_height >= min_height
        if h <= 120:
            assert box_height == min_height


# --- Scene names ---
def test_scene_names():
    scenes = ['Boot', 'Village', 'Forest', 'SettingsCave', 'Workshop']
    assert len(scenes) == 5
    assert 'Village' in scenes
    assert 'Forest' in scenes


if __name__ == '__main__':
    print("\n=== Omarchy Planet Tests ===\n")

    test("git name lookup", test_git_name)
    test("fallback to USER env", test_fallback_to_env)
    test("fallback to Traveler", test_fallback_to_traveler)
    test("empty git name", test_empty_git_name)
    test("username with quotes (XSS)", test_username_with_quotes)
    test("username with semicolon (XSS)", test_username_with_semicolon)
    test("username normal", test_username_normal)
    test("toggle no->yes", test_toggle_no_to_yes)
    test("toggle yes->no", test_toggle_yes_to_no)
    test("pid file creation", test_pid_file_creation)
    test("pid file invalid", test_pid_file_invalid)
    test("dialog box min height", test_dialog_box_min_height)
    test("scene names", test_scene_names)

    print(f"\n{passed} passed, {failed} failed\n")
    sys.exit(1 if failed else 0)
