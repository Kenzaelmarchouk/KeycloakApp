const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const app = express();
const port = 3000;
const keycloakConfig = require('./keycloak.json');
const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore });
app.use(session({
    secret: 'mymKWhjV<T=-*VW<;cC5Y6U-{F.ppK+])Ubt',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));
app.use(keycloak.middleware());


// Custom middleware to check user role
function checkRole(role) {
    return function(req, res, next) {
const accessToken = req.kauth.grant.access_token.token;
 const username = req.kauth.grant.access_token.content.preferred_username;
const userRoles = req.kauth.grant.access_token.content.realm_access.roles;


if (userRoles.includes(role)) {
            next(); // Role is correct, continue
        } else {
            res.status(403).send('Access denied'); // Role doesn't match, send access denied
        }
    };
}


// Home page with authentication buttons
app.get('/', (req, res) => { res.send(`
        <button onclick="window.location.href='/login/candidate'">Candidate</button>
        <button onclick="window.location.href='/login/resident'">Resident</button>
    `);});

// Protected routes for candidate and resident
app.get('/login/:role', keycloak.protect(),(req, res, next) => {
    const role = req.params.role;
    const roleCheckMiddleware = checkRole(role);
roleCheckMiddleware(req, res, async () => {
try{
    
    const username = req.kauth.grant.access_token.content.preferred_username;
    

res.send(`

        <h1>Space ${role}</h1>
        <p>Welcome ${username}</p>
        <form action="/logout" method="post">
            <button type="submit">Logout</button>
        </form>
 
    `);
} catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal server error.');
        }
});
});

// Logout route
app.post('/logout', keycloak.protect(), (req, res) => {
    req.logout(); // Clear the user's session
    res.redirect('/'); // Redirect the user back to the home page
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://vm1150.maq.aduneo.com:${port}`);
});

