<?php namespace MakgaboPhao\Goldwidgets;
use RainLab\Builder\Widgets\DefaultControlDesignTimeProvider;

class ControlDesignTimeProvider extends DefaultControlDesignTimeProvider {
	public function __construct(){
		$this->defaultControlsTypes = ['documentfinder'];
	}
} 
