import { lua, lauxlib, lualib } from 'fengari';
import { to_jsstring, to_luastring } from 'fengari-interop';
import fs from 'fs/promises';

async function main() {
    // Load Lua script
    const luaScript = await fs.readFile('./script.lua', 'utf8');

    // Create a new Lua state
    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);

    // Load and run the Lua script
    lauxlib.luaL_dostring(L, to_luastring(luaScript));

    // Push the Lua function onto the stack
    lua.lua_getglobal(L, to_luastring("greet"));

    // Push the argument for the Lua function
    lua.lua_pushstring(L, to_luastring("World"));

    // Call the Lua function with 1 argument and 1 return value
    if (lua.lua_pcall(L, 1, 1, 0) !== lua.LUA_OK) {
        throw new Error(to_jsstring(lua.lua_tostring(L, -1)));
    }

    // Get the result from the Lua function
    const result = to_jsstring(lua.lua_tostring(L, -1));
    lua.lua_pop(L, 1);

    console.log(result); // Output: Hello, World from Lua!
}

main().catch(err => console.error(err));
