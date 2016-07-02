class HomeController extends Controller {

    constructor(app) {
        super(app);

    }

    preRender(defer) {

        return super.preRender(defer);
    }

    postRender(defer) {

        return super.postRender(defer);
    }

    destructor(defer) {

        return super.destructor(defer);
    }
}

window.classes["HomeController"] = HomeController;