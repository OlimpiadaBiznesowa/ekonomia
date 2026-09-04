const {test} = require('node:test');
const assert = require('node:assert/strict');
const {number,elasticity,market} = require('../economic-tools-math.js');
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-8, `${a} != ${b}`);
test('Polish decimal input and invalid input',()=>{
  assert.equal(number(' 12,5 '),12.5);
  for(const value of ['', 'abc', '1,2,3', 'Infinity', '1e999', '1000000001','<img>','0.00000000001']) assert.throws(()=>number(value));
});
test('Midpoint worked example and revenue',()=>{
  const r=elasticity([10,12,100,80]);
  near(r.signed,-11/9); near(r.priceChange,2/11); near(r.quantityChange,-2/9);
  assert.equal(r.kind,'Elastyczny'); assert.equal(r.revenue1,1000); assert.equal(r.revenue2,960);
});
test('Base method is different and direction sensitive',()=>{
  near(elasticity([10,12,100,80],'base').signed,-1);
  near(elasticity([12,10,80,100],'base').signed,-1.5);
});
test('Midpoint is symmetric for reversing observations',()=>{
  for(let i=1;i<200;i++) near(elasticity([i,i+3,i*10,i*8]).magnitude,elasticity([i+3,i,i*8,i*10]).magnitude);
});
test('Elasticity boundary cases and classification',()=>{
  assert.equal(elasticity([10,20,100,100]).kind,'Doskonale nieelastyczny');
  assert.equal(elasticity([10,20,100,50]).kind,'Jednostkowo elastyczny');
  assert.equal(elasticity([10,20,100,90]).kind,'Nieelastyczny');
  assert.ok(elasticity([10,20,100,120]).signed>0);
  assert.ok(Number.isFinite(elasticity([10,20,0,100]).signed));
  assert.ok(Number.isFinite(elasticity([10,20,100,0],'base').signed));
  for(const values of [[10,10,100,80],[0,10,100,80],[-1,10,100,80],[10,12,-1,2],[10,12,0,0]]) assert.throws(()=>elasticity(values));
  assert.throws(()=>elasticity([10,12,0,100],'base'));
  assert.throws(()=>elasticity([10,12,100,80],'invalid'));
});
const defaults={a:120,b:2,c:0,d:2,price:30};
test('Initial market and scenarios',()=>{
  const r=market(defaults); near(r.equilibriumPrice,30); near(r.equilibriumQuantity,60); near(r.gap,0);
  const demand=market({...defaults,demandShift:40}); near(demand.equilibriumPrice,40); near(demand.equilibriumQuantity,80);
  const supply=market({...defaults,supplyShift:40}); near(supply.equilibriumPrice,20); near(supply.equilibriumQuantity,80);
  const costs=market({...defaults,supplyShift:-40}); near(costs.equilibriumPrice,40); near(costs.equilibriumQuantity,40);
});
test('Shortage, surplus and nonnegative quantities',()=>{
  near(market({...defaults,price:20}).gap,40);
  near(market({...defaults,price:40}).gap,-40);
  assert.equal(market({...defaults,price:120}).demand,0);
  assert.equal(market({...defaults,c:-40,price:0}).supply,0);
  assert.equal(market({...defaults,a:60,demandShift:-60,c:40,supplyShift:60}).feasible,false);
  assert.equal(market({...defaults,a:60,demandShift:-60,c:-40,supplyShift:-60}).feasible,false);
  assert.throws(()=>market({...defaults,b:0})); assert.throws(()=>market({...defaults,price:NaN}));
});
test('Equation consistency across all extreme slider combinations',()=>{
  for(const a of [60,120,200]) for(const b of [1,2,5]) for(const c of [-40,0,40]) for(const d of [1,2,5]) for(const demandShift of [-60,0,60]) for(const supplyShift of [-60,0,60]) {
    const r=market({a,b,c,d,demandShift,supplyShift,price:30});
    near(r.A-b*r.equilibriumPrice,r.C+d*r.equilibriumPrice);
    if(r.feasible) assert.ok(r.equilibriumPrice>=0 && r.equilibriumQuantity>=0);
    assert.ok(r.demand>=0 && r.supply>=0);
  }
});
