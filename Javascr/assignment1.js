let userRole = "editor", isAuthenticated = true, userAge =69;
function AuthenticateUser(role, authenticated, age) {
    if(role == "guest"){
        console.log("Please Log In.");
    }
    else if(role == "admin" && authenticated){
        console.log("Welcome to Dashboard.");
    }
    else if(authenticated){
        console.log("Access Denied.");
    }
}
AuthenticateUser(userRole, isAuthenticated, userAge);