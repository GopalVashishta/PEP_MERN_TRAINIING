const obj = {
    age:23,
    printAge() {
        console.log(`Age is: ${this.age}`);
    }
}
obj.printAge();