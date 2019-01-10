const dragonEvents = [
  {"type": "yawn", "target": "fluffy", "value": 12},
  {"type": "attack", "value": 15, "target":"dorkman"},
  {"type": "attack", "target": "fluffy", "value": 17},
  {"type": "attack", "target":"dorkman", "value": 13}
];

const totalDamage = dragonEvents
.filter(event => event.type == "attack" )
.filter(event => event.target=="dorkman" )
.map(event => event.value )
.reduce((previous, value) => previous + value );


console.log('totalDamage\n', totalDamage);
