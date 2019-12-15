// print 1 - 100
// for i % 3 === 0 print fizz
// for i % 5 === 0 print buzz
// for i % 7 === 0 print bazz
// for i % 9 === 0 print badazzle

for (let i = 1; i < 101; ++i) {
    if (i % 3 === 0 && i % 5 === 0 && i % 7 === 0) {
    }
    else if (i % 3 === 0 && i % 5 === 0) {
        console.log("fizzbuzz");
    }
    else if (i % 3 === 0 && i % 7 === 0) {
    }
    else if (i % 7 === 0 && i % 5 === 0) {
    }
    else if (i % 7 === 0) {
    }
    else if (i % 5 === 0) {
        console.log("buzz");
    }
    else if (i % 3 === 0) {
       console.log("fizz");
    }
    else {
        console.log(i);
    }
}

const amounts = {
    3: 'fizz',
    5: 'buz',
    7: 'baz',
};
const keys = Object.keys(amounts);

for (let i = 1; i < 101; ++i) {
    let out = "";
    keys.forEach(k => {
        if (i % k === 0) {
            out += amounts[k];
        }
    });
    if (!out.length) {
        out = i;
    }
    console.log(out);
}
