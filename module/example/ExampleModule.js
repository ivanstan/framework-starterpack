class ExampleModule extends Module {

    constructor(app) {
        super(app);

        this.routes = {
            '/': {
                state: 'home'
            },
            'home': {
                state: 'home'
            }
        };

    }

    preRender(defer) {

        return super.preRender(defer);
    }

    postRender(defer) {

        return super.postRender(defer);
    }

}

window.classes["ExampleModule"] = ExampleModule;