import KillCodeKeyboard from '../../../src/app/keyboards/KillCodeKeyboard'

test(`killcode keyboard contains all uppercase letters and numbers, 
    together with the ⌫ button`, () => 
{
    const stringifiedKeyboard = KillCodeKeyboard.map(row => 
        row.map(col => col.text).join(' ')).join('\n')
    
    expect(stringifiedKeyboard).toBe(
            '0 1 2 3 4 5 6 7 8 9\n' +
            'Q W E R T Y U I O P\n' +
            'A S D F G H J K L\n' +
            'Z X C V B N M ⌫'
        )
});