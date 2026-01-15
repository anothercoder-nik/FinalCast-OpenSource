const wrapAsync = (fn) => {
    return function(req, res, next) {
        // Execute the function and catch any errors
        fn(req, res, next).catch(next);
    };
};

export default wrapAsync;