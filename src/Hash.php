<?php

use JDZ\Utils\Data as jData;

class Hash extends jData
{
    private array $exportVars = [];

    public function __construct(array $properties = [])
    {
        /*
        $this->def('title', '');
        $this->def('content', '');
        $this->def('theme', 'hasher');
        $this->def('type', '');
        $this->def('point', '');
        $this->def('footer', '');
        $this->def('ariaTitle', '');
        $this->def('ariaDescription', '');
        $this->def('closeText', '');
        $this->def('closeButtonText', 'Close');
        $this->def('noheader', false);
        $this->def('nofooter', false);
        $this->def('closeIcon', true);
        $this->def('sm', false);
        $this->def('lg', false);
        $this->def('footerCloseButton', false);
        */

        foreach ($properties as $key => $value) {
            if (property_exists($this, $key)) {
                $this->set($key, $value);
            }
        }
    }

    public function set(string $key, mixed $value): void
    {
        if (!in_array($key, $this->exportVars)) {
            $this->exportVars[] = $key;
        }

        parent::set($key, $value);
    }

    public function responseData(): array
    {
        $data = [];
        foreach ($this->exportVars as $var) {
            $data[$var] = $this->$var;
        }
        return $data;
    }
}
