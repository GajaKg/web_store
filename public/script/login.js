function getServiceData(method, url, bool){
    
    try{
        var result, req;
        /*
        if(window.XMLHttpRequest()){
            req = new XMLHttpRequest();
        } else {
            req = new ActiveXObject("Microsoft.XMLHTTP");
        }
        */
        
        req = new XMLHttpRequest();
        
        req.onreadystatechange = function(){
            if(req.readyState == 4 && req.status == 200){
                console.log("success");
                result = JSON.parse(req.response);
            }
        }
        
        req.open(method, url, bool);
        req.send();
        return result;
    }
    catch(error){
        return error;
    }
}

var customers = getServiceData("GET", "https://services.odata.org/V3/Northwind/Northwind.svc/Orders?&$format=json", false).value;
console.log(customers);

//------------------------------------------------- LOGIN --------------------------------------------\\

$(document).ready(function(){
    

$("#login").click(function(){
   
    var username = $("#username").val();
    var password = $("#password").val();

    if(findCustomer(username, password)){
       //console.log("asd");
        sessionStorage.setItem('isActiveSession', true);
        sessionStorage.setItem('user', username); 
        window.location = 'index.html';
    } else {

        alert("Username or password are incorrect");
        /*
        $('.notyfication').noty({
            text: 'NOTY - a jquery notification library!'
        });
        */
    }
    
});
  
    
  
}); // $(document).ready(function(){

function findCustomer(username, pass){
    for(var c in customers){
        if(customers[c].CustomerID == username && customers[c].CustomerID == pass){
            return true;
            break;
        } 
    } 
} 



function logout(){
    //var customer = sessionStorage.getItem("user");
    localStorage.removeItem("user");
    window.location = 'login.html';
}