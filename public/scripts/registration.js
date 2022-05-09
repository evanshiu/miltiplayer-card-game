const Registration = (function() {

    const register = function(username, name, password, onSuccess, onError) {

        //
        // A. Preparing the user data
        
        const jsonData = JSON.stringify({username, name, password})
 
        //
        // B. Sending the AJAX request to the server
        //
        fetch("/register", { 
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: jsonData
        })
        .then((res)=> res.json())

        


        //
        // F. Processing any error returned by the server
        // J. Handling the success response from the server
        //
        .then((json) => {
            if (json.status == "success"){
                if (onSuccess) onSuccess();
            }
            else {
                if (onError) onError(json.error);
            }
        })
        .catch((error) => {
            if (onError) onError(json.error);
        });

    };

    return { register };
})();
