# Autotyper
# Types out the text in your clipboard a bit after the script starts.
# Usage python type.py <MS>
# MS is the time between keystrokes (in ms).

# Not using keyboard libraries because my school didn't let me download anything lol.

import ctypes
from ctypes import wintypes
import time
import sys
import re
from tkinter import Tk

user32 = ctypes.WinDLL('user32', use_last_error=True)

INPUT_MOUSE    = 0
INPUT_KEYBOARD = 1
INPUT_HARDWARE = 2

KEYEVENTF_EXTENDEDKEY = 0x0001
KEYEVENTF_KEYUP       = 0x0002
KEYEVENTF_UNICODE     = 0x0004
KEYEVENTF_SCANCODE    = 0x0008

MAPVK_VK_TO_VSC = 0

# msdn.microsoft.com/en-us/library/dd375731
VK_TAB  = 0x09
VK_MENU = 0x12

# C struct definitions

wintypes.ULONG_PTR = wintypes.WPARAM

class MOUSEINPUT(ctypes.Structure):
    _fields_ = (("dx",          wintypes.LONG),
                ("dy",          wintypes.LONG),
                ("mouseData",   wintypes.DWORD),
                ("dwFlags",     wintypes.DWORD),
                ("time",        wintypes.DWORD),
                ("dwExtraInfo", wintypes.ULONG_PTR))

class KEYBDINPUT(ctypes.Structure):
    _fields_ = (("wVk",         wintypes.WORD),
                ("wScan",       wintypes.WORD),
                ("dwFlags",     wintypes.DWORD),
                ("time",        wintypes.DWORD),
                ("dwExtraInfo", wintypes.ULONG_PTR))

    def __init__(self, *args, **kwds):
        super(KEYBDINPUT, self).__init__(*args, **kwds)
        # some programs use the scan code even if KEYEVENTF_SCANCODE
        # isn't set in dwFflags, so attempt to map the correct code.
        if not self.dwFlags & KEYEVENTF_UNICODE:
            self.wScan = user32.MapVirtualKeyExW(self.wVk,
                                                 MAPVK_VK_TO_VSC, 0)

class HARDWAREINPUT(ctypes.Structure):
    _fields_ = (("uMsg",    wintypes.DWORD),
                ("wParamL", wintypes.WORD),
                ("wParamH", wintypes.WORD))

class INPUT(ctypes.Structure):
    class _INPUT(ctypes.Union):
        _fields_ = (("ki", KEYBDINPUT),
                    ("mi", MOUSEINPUT),
                    ("hi", HARDWAREINPUT))
    _anonymous_ = ("_input",)
    _fields_ = (("type",   wintypes.DWORD),
                ("_input", _INPUT))

LPINPUT = ctypes.POINTER(INPUT)

def _check_count(result, func, args):
    if result == 0:
        raise ctypes.WinError(ctypes.get_last_error())
    return args

user32.SendInput.errcheck = _check_count
user32.SendInput.argtypes = (wintypes.UINT, # nInputs
                             LPINPUT,       # pInputs
                             ctypes.c_int)  # cbSize

# Functions

def PressKey(hexKeyCode):
    x = INPUT(type=INPUT_KEYBOARD,
              ki=KEYBDINPUT(wVk=hexKeyCode))
    user32.SendInput(1, ctypes.byref(x), ctypes.sizeof(x))

def ReleaseKey(hexKeyCode):
    x = INPUT(type=INPUT_KEYBOARD,
              ki=KEYBDINPUT(wVk=hexKeyCode,
                            dwFlags=KEYEVENTF_KEYUP))
    user32.SendInput(1, ctypes.byref(x), ctypes.sizeof(x))

def PR(char):
    PressKey(key_map[char])
    ReleaseKey(key_map[char])

def ShiftPR(char):
    PressKey(key_map["SHIFT"])
    PressKey(key_map[char])
    ReleaseKey(key_map[char])
    ReleaseKey(key_map["SHIFT"])

def type_stuff(speed, string):
    for char in string:
        letter_pattern = re.compile("[a-zA-Z]")
        number_pattern = re.compile("[0-9]")
        if letter_pattern.match(char):
            if char.islower():
                PR(char)
            else:
                ShiftPR(char.lower())
        elif number_pattern.match(char):
            PR(char)
        else:
            if char == " ": PR(char)
            if char == ".": PR(char)
            if char == ",": PR(char)
            if char == "/": PR(char)
            if char == "?": ShiftPR("/")
            if char == ";": PR(char)
            if char == ":": ShiftPR(";")
            if char == "-": PR(char)
            if char == "!": ShiftPR("1")
            if char == "$": ShiftPR("4")
            if char == "(": ShiftPR("9")
            if char == ")": ShiftPR("0")
            if char == "'": PR(char)
            if char == "\"": ShiftPR("'")
            if char == "\n": PR("ENTER")
        time.sleep(speed)

class Map(object):
    def __getitem__(self, key):
        return getattr(self, str(key))
    def __setitem__(self, key, value):
        return setattr(self, str(key), value)

key_map = Map()
key_map["L_MOUSE"] = 0x01
kep_map["R_MOUSE"] = 0x02
key_map["L_ARROW"] = 0x25
key_map["U_ARROW"] = 0x26
key_map["R_ARROW"] = 0x27
key_map["D_ARROW"] = 0x28
key_map["SHIFT"] = 0x10
key_map["ENTER"] = 0x0D
key_map["0"] = 0x30 # SHIFT -> )
key_map["1"] = 0x31 # SHIFT -> !
key_map["2"] = 0x32 # SHIFT -> @
key_map["3"] = 0x33 # SHIFT -> #
key_map["4"] = 0x34 # SHIFT -> $
key_map["5"] = 0x35 # SHIFT -> %
key_map["6"] = 0x36 # SHIFT -> ^
key_map["7"] = 0x37 # SHIFT -> &
key_map["8"] = 0x38 # SHIFT -> *
key_map["9"] = 0x39 # SHIFT -> (
key_map["a"] = 0x41 # SHIFT -> A
key_map["b"] = 0x42 # SHIFT -> B
key_map["c"] = 0x43 # SHIFT -> C
key_map["d"] = 0x44 # SHIFT -> D
key_map["e"] = 0x45 # SHIFT -> E
key_map["f"] = 0x46 # SHIFT -> F
key_map["g"] = 0x47 # SHIFT -> G
key_map["h"] = 0x48 # SHIFT -> H
key_map["i"] = 0x49 # SHIFT -> I
key_map["j"] = 0x4A # SHIFT -> J
key_map["k"] = 0x4B # SHIFT -> K
key_map["l"] = 0x4C # SHIFT -> L
key_map["m"] = 0x4D # SHIFT -> M
key_map["n"] = 0x4E # SHIFT -> N
key_map["o"] = 0x4F # SHIFT -> O
key_map["p"] = 0x50 # SHIFT -> P
key_map["q"] = 0x51 # SHIFT -> Q
key_map["r"] = 0x52 # SHIFT -> R
key_map["s"] = 0x53 # SHIFT -> S
key_map["t"] = 0x54 # SHIFT -> T
key_map["u"] = 0x55 # SHIFT -> U
key_map["v"] = 0x56 # SHIFT -> V
key_map["w"] = 0x57 # SHIFT -> W
key_map["x"] = 0x58 # SHIFT -> X
key_map["y"] = 0x59 # SHIFT -> Y
key_map["z"] = 0x5A # SHIFT -> Z
key_map[" "] = 0x20
key_map["."] = 0xBE # SHIFT -> >
key_map[","] = 0xBC # SHIFT -> <
key_map["-"] = 0xBD # SHIFT -> _
key_map["/"] = 0xBF # SHIFT -> ?
key_map[";"] = 0xBA # SHIFT -> :
key_map["'"] = 0xDE # SHIFT -> "

if __name__ == "__main__":
    speed = sys.argv[1]
    time.sleep(100)
    type_stuff(float(speed), Tk().clipboard_get())