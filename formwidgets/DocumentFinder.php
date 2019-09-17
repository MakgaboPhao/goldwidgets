<?php namespace Makgabophao\GoldWidgets\FormWidgets;

use Backend\Classes\FormWidgetBase;

/**
 * DocumentFinder Form Widget
 */
class DocumentFinder extends FormWidgetBase
{
    use \Backend\Traits\FormModelWidget;
    //
    // Configurable properties
    //

    /**
     * @var string Prompt to display if no record is selected.
     */
    public $prompt = 'Click the %s button to find a record';

    /**
     * @var string Display mode for the selection. Values: file, folder.
     */
    public $mode = 'file';

    /**
     * @var string Document server IP address or name.
     */
    public $server;

    /**
     * @var string Username to login.
     */
    public $username;

    /**
     * @var string Password to login.
     */
    public $password;

    /**
     * @inheritDoc
     */
    protected $defaultAlias = 'makgabophao_goldwidgets_documentfinder';

    /**
     * @inheritDoc
     */
    public function init()
    {
        $this->fillFromConfig([
            'prompt',
            'mode',
            'server',
            'username',
            'password'
        ]);

        if ($this->formField->disabled) {
            $this->previewMode = true;
        }
    }

    /**
     * @inheritDoc
     */
    public function render()
    {
        $this->prepareVars();
        return $this->makePartial('documentfinder');
    }

    /**
     * Prepares the form widget view data
     */
    public function prepareVars()
    {
        $this->vars['name'] = $this->formField->getName();
        $this->vars['value'] = $this->getLoadValue();
        $this->vars['model'] = $this->model;
        $this->vars['field'] = $this->formField;
        $this->vars['prompt'] = str_replace('%s', '<i class="icon-folder-o"></i>', trans($this->prompt));
        $this->vars['mode'] = $this->mode;
        $this->vars['server'] = $this->server;
        $this->vars['username'] = $this->username;
        $this->vars['password'] = $this->password;
    }

    /**
     * @inheritDoc
     */
    public function loadAssets()
    {
        $this->addCss('css/documentfinder.css', 'makgabophao.goldwidgets');
        $this->addCss('css/ui.dynatree.css', 'makgabophao.goldwidgets');
        $this->addJs('js/documentfinder.js', 'makgabophao.goldwidgets');
        $this->addJs('js/jquery-ui.custom.js', 'makgabophao.goldwidgets');
        $this->addJs('js/jquery.cookie.js', 'makgabophao.goldwidgets');
        $this->addJs('js/jquery.dynatree.js', 'makgabophao.goldwidgets');
    }

    /**
     * @inheritDoc
     */
    public function getSaveValue($value)
    {
        if ($this->formField->disabled || $this->formField->hidden) {
            return FormField::NO_SAVE_DATA;
        }

        return $value;
    }

    public function onLoadContent() {
        return $this->makePartial('documentfinder_form');
    }

    public function onGetCredentials() {
        return [
            'username' => $this->username,
            'password' => $this->password,
            'mode' => $this->mode,
            'server' => $this->server
        ];
    }

    public function onLogin() {
        $alf_ticket = file_get_contents('http://docs.parliament.gov.za/alfresco/service/api/login?u=' . $this->username . '&pw=' . $this->password . '&format=json');
        return json_decode($alf_ticket)->data->ticket;

    }
}
