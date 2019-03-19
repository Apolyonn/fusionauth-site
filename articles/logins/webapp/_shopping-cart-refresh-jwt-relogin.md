1. A while later, the user's refresh token expires and the user clicks on their shopping cart again. The browser will request the shopping cart from the application backend and will send the JWT and refresh token to the application backend
1. The application backend will verify the JWT and realizes it is expired. Since the browser also sent across the refresh token, the application backend calls the JWT refresh API in FusionAuth with the refresh token
1. Since the refresh token has expired, FusionAuth returns a 404 status code
1. Since FusionAuth returned a 404 status code, the application backend returns a redirect to the browser that will send the user to the login page
1. The user can log in the same way they did above