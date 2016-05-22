'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.install = install;
const name = exports.name = 'foo';
const lua = exports.lua = `--!/usr/bin/env lua
-- name pdel
-- nkeys 1

local function deleteKeys (keys)
  for i, name in ipairs(keys) do
    redis.call("DEL", name)
  end
end

if type(redis.replicate_commands) == 'function' and redis.replicate_commands() then -- Redis 3.2+
  local count = 0
  local cursor = "0"
  local keys

  repeat
    cursor, keys = unpack(redis.call("SCAN", cursor, "MATCH", KEYS[1]))
    count = count + #keys
    deleteKeys(keys)
  until cursor == "0"

  return count
else
  local keys = redis.call("KEYS", KEYS[1])
  deleteKeys(keys)
  return #keys
end
`;
const numberOfKeys = exports.numberOfKeys = 1;

const tmpName = name;
const tmpNumberOfKeys = numberOfKeys;
function install(ioredis) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref$name = _ref.name;
  let name = _ref$name === undefined ? tmpName : _ref$name;
  var _ref$numberOfKeys = _ref.numberOfKeys;
  let numberOfKeys = _ref$numberOfKeys === undefined ? tmpNumberOfKeys : _ref$numberOfKeys;

  if (typeof name !== 'string') throw new Error('Lua script name is missing');

  ioredis.defineCommand(name, {
    lua: lua,
    numberOfKeys: numberOfKeys
  });
}
