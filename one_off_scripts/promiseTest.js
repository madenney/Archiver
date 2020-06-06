

function foo(){
    console.log("Foo");
}

async function bar(){
    //return new Promise((resolve,reject)=> {
        setTimeout(() => {
            console.log("Bar")
            resolve();
        },1000)
    //})
}


async function main(){

    foo();
    const thing = await bar();
    console.log(thing)
    console.log("Here");
}

main();