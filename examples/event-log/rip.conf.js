module.exports = {
    'name': 'Event Log',
    'description': 'This is an example RIPJS application. It is a simple application for logging events in a system.',
    'db': {
        'name': 'events.db',
        'create': true,
        'load': true
    },
    'logging': true,
    'models': [{
        'name': 'Event',
        'attributes': {
            'email': {
                'id': true,
                'required': true,
                'default': 'admin@host.com'
            },
            'when': {
                'required': true,
                'autogenerate': true,
                'generator': function() {
                    return new Date();
                }
            }
        }
    }]
};
