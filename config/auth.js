
module.exports = {

    'facebookAuth' : {
		'clientID' 		: '677153732711766', 
		'clientSecret' 	: 'c0b2f2c7ff1813192a55d81f15673f3d', 
		'callbackURL' 	: 'http://localhost:80/api/facebook/auth/facebook/callback'
	},

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:80/api/twitter/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '367493252658-3gq4orvc508bfh4e7h9cti2tk1k0cdac.apps.googleusercontent.com',
        'clientSecret'  : 'ci8uB6kGPS9_r4sh-76-FRJe',
        'callbackURL'   : 'http://localhost:80/api/users/auth/google/callback'
    }

};