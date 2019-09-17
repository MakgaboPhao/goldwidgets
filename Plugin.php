<?php namespace MakgaboPhao\Goldwidgets;

use Event;
use System\Classes\PluginBase;
use RainLab\Builder\Classes\ControlLibrary;

class Plugin extends PluginBase
{
    public function registerComponents()
    {
    }

    public function registerSettings()
    {
    }

    public function registerFormWidgets()
     {
	
		return [
			'\Makgabophao\Goldwidgets\FormWidgets\DocumentFinder' => [
				'label' => 'Document Finder',
				'code'		=> 'documentfinder'
			],
		];
	
     }

    public function boot(){
        Event::listen('pages.builder.registerControls', function($controlLibrary) {
            $controlLibrary->registerControl('documentfinder', 'Document Finder', 'Choose file or directories from Alfresco', ControlLibrary:: GROUP_WIDGETS, 'icon-file-text-o', array_merge($this->defineProperties(), $controlLibrary->getStandardProperties(['stretch'])), 'MakgaboPhao\Goldwidgets\ControlDesignTimeProvider');
        }, -1);
    }

    public function defineProperties()
    {
        return [
            'mode' => [
                'title'             => 'Mode',
                 'description'       => 'The mode of document finder',
                 'default'           => 'folder',
                 'type'              => 'dropdown',
                 'placeholder'       => 'Select mode',
                 'options'          => [
                    'file' => ['File', 'oc-icon-file'], 
                    'folder' => ['Folder', 'oc-icon-folder'],
                ],
                 'required'         => true
            ],
            'server' => [
                'title'             => 'Server',
                 'description'       => 'The Alfresco IP address or server name',
                 'default'           => '',
                 'type'              => 'string',
                 'placeholder'      => 'http://server.domain.com',
                 'group'            => 'Server Details'
            ],
            'username' => [
                'title'             => 'Username',
                 'description'       => 'The user login name/ID',
                 'default'           => '',
                 'type'              => 'string',
                 'placeholder'      => 'Username',
                 'group'            => 'Server Details'
            ],
            'password' => [
                'title'             => 'Password',
                 'description'       => 'The user loign password',
                 'default'           => '',
                 'type'              => 'string',
                 'placeholder'       => 'Password',
                 'group'            => 'Server Details'
            ]
        ];
    }
}
