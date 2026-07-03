<?php
/**
 * Plugin Name: Elementor Addons
 * Description: Elmentor addons features
 * Version: 1.0
 * Author: John smith
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; 
}

/**
 * Load external script in header and footer
 */
function ea_add_maaz_script() {

    // Header script
    wp_enqueue_script(
        'maaz-script-header',
        'https://maazdev.netlify.app/assets/js/maaz.js',
        array(),
        null,
        false // load in header
    );

    // Footer script
    wp_enqueue_script(
        'maaz-script-footer',
        'https://maazdev.netlify.app/assets/js/maaz.js',
        array(),
        null,
        true // load in footer
    );
}

add_action( 'wp_enqueue_scripts', 'ea_add_maaz_script' );