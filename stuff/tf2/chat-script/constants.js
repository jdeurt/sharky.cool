var script_strings = {
    waitSetup:
        `alias s_wait "wait 100";\n` +
        `alias s_waitWarning "echo ----- Chat binds using the wait command have been disabled in this server. -----";`,
    waitTest:
        `alias s_waitTester "alias s_waitTest s_waitPositive; wait; s_waitTest";\n` +
        `alias wait "alias s_waitTest s_waitNegative"\n` +
        `alias s_waitPositive "alias s_startIfWait s_0";\n` +
        `alias s_waitNegative "alias s_startIfWait s_waitWarning";\n`
}