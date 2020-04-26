

const foo = function(){

    return new Promise((resolve,reject) => {
        console.log("1")
        setTimeout(() => {
            console.log("Thing done");
            resolve();
        }, 2000)
        console.log("2");
    }) 
}

async function bar(){
    console.log("YO")
    await foo();
    console.log("HEY")
}
bar();