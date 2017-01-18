<?php

require_once __DIR__ . '/../app/server/vendor/autoload.php';
require_once __DIR__ . '/../app/server/data/data.php';
require_once __DIR__ . '/../app/server/data/ProjectConverter.php';


use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

$app = new Silex\Application();

// $app['debug'] = true;


// Register Twig provider and define a path for twig templates
$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/../app/server/views',
));

$app['twig'] = $app->share($app->extend('twig', function($twig, $app) {
    $twig->addFunction(new \Twig_SimpleFunction('asset', function ($asset) use ($app) {
        return sprintf('%s/static/%s', trim($app['request']->getBasePath()), ltrim($asset, '/'));
    }));
    return $twig;
}));

$app->before(function ($request) use ($app) {
    $app['twig']->addGlobal('active', $request->get("_route"));
});

$app->register(new Silex\Provider\UrlGeneratorServiceProvider());


$app['converter.project'] = function () use ($projects){
    return new ProjectConverter($projects);
};

// Home page
$app->get('/', function() use($app,$projects,$footer) {
    return $app['twig']->render('index.twig',array(
        'projects'=>$projects,
        'footer'=>$footer,

        ));
})->bind('home');

// Project
$app->get('/project/{projectName}', function ($projectName) use ($app,$footer) {
    return $app['twig']->render('project.twig', array(
        'project' => $projectName,
        'footer'=>$footer,
    ));
})
->bind('project')
->value('projectName','')
->convert('projectName', 'converter.project:convert');

// About
$app->get('/about', function() use($app,$about,$footer) {
    return $app['twig']->render('about.twig',array(
        'about'=>$about,
        'footer'=>$footer,
        ));
})->bind('about');

// Contact
$app->get('/contact', function() use($app,$contact,$footer) {
    return $app['twig']->render('contact.twig',array(
        'contact'=>$contact,
        'footer'=>$footer,
        ));
})->bind('contact');


// 404 - Page not found
$app->error(function (\Exception $e, $code) use ($app) {
    switch ($code) {
        case 404:
          return $app['twig']->render('404.twig');
            $message = 'The requested page could not be found.';
            break;
        default:
            $message = 'We are sorry, but something went terribly wrong.';
            $message .= $e->getMessage();
    }

    return new Response($message);
});

$app->run();

?>