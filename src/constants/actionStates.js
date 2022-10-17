

const damageStates = [0x4B,0x4C,0x4D,0x4E,0x4F,0x50,0x51,0x52,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5A,0x5B]
const shineStates = [360,361,362,363,364,365,366,367,368]

const actionStates = [
    {
      id: 1,
      name: "Damage",
      shortName: "Damage",
      actionStateID: damageStates
    },
    {
      id: 100,
      name: "Shield Stun",
      shortName: "Shield Stun",
      actionStateID: 0xB5
    },
    {
      id: 101,
      name: "Shine",
      shortName: "Shine",
      actionStateID: shineStates
    },
    {
      id: 2,
      name: "Jab",
      shortName: "jab",
      actionStateID: 0x2c
    },
    {
      id: 3,
      name: "Jab",
      shortName: "jab",
      actionStateID: 0x2d
    },
    {
      id: 4,
      name: "Jab",
      shortName: "jab",
      actionStateID: 0x2e
    },
    {
      id: 5,
      name: "Rapid Jabs",
      shortName: "rapid-jabs",
      actionStateID: 0x2f
    },
    {
      id: 6,
      name: "Dash Attack",
      shortName: "dash",
      actionStateID: 0x32
    },
    {
      id: 8,
      name: "Up Tilt",
      shortName: "utilt",
      actionStateID: 0x38
    },
    {
      id: 9,
      name: "Down Tilt",
      shortName: "dtilt",
      actionStateID: 0x39
    },
    {
      id: 11,
      name: "Up Smash",
      shortName: "usmash",
      actionStateID: 0x3f
    },
    {
      id: 12,
      name: "Down Smash",
      shortName: "dsmash",
      actionStateID: 0x40
    },
    {
      id: 13,
      name: "Neutral Air",
      shortName: "nair",
      actionStateID: 0x41
    },
    {
      id: 14,
      name: "Forward Air",
      shortName: "fair",
      actionStateID: 0x42
    },
    {
      id: 15,
      name: "Back Air",
      shortName: "bair",
      actionStateID: 0x43
    },
    {
      id: 16,
      name: "Up Air",
      shortName: "uair",
      actionStateID: 0x44
    },
    {
      id: 17,
      name: "Down Air",
      shortName: "dair",
      actionStateID: 0x45
    },
  ];
  
  module.exports = {actionStates}