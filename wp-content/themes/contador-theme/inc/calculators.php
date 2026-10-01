<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Carga los assets compilados de React/Vite para las calculadoras.
 */
function contador_enqueue_calculator_assets(): void
{
    if (!is_page_template('page-calculator.php')) {
        return;
    }

    $manifest_path = get_template_directory() . '/dist/.vite/manifest.json';

    if (!file_exists($manifest_path)) {
        return;
    }

    $manifest = json_decode(
        file_get_contents($manifest_path),
        true
    );

    $entry = $manifest['src/calculators/main.tsx'] ?? null;

    if (!$entry || empty($entry['file'])) {
        return;
    }

    foreach (($entry['css'] ?? []) as $index => $css_file) {
        wp_enqueue_style(
            'contador-calculators-' . $index,
            get_template_directory_uri() . '/dist/' . $css_file,
            [],
            null
        );
    }

    wp_enqueue_script(
        'contador-calculators',
        get_template_directory_uri() . '/dist/' . $entry['file'],
        [],
        null,
        true
    );
}

add_action('wp_enqueue_scripts', 'contador_enqueue_calculator_assets');

/** Vite emits ES modules; scope the module attribute to the calculator bundle. */
function contador_calculator_module_script(string $tag, string $handle): string
{
    if ('contador-calculators' !== $handle) {
        return $tag;
    }

    return str_replace('<script ', '<script type="module" ', $tag);
}
add_filter('script_loader_tag', 'contador_calculator_module_script', 10, 2);
