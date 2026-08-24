/**
 * Ambient declarations for the dashboard-only vendor libraries.
 *
 * jQuery and Summernote are loaded dynamically inside
 * components/admin/Summernote.tsx and used through a deliberately untyped
 * handle — pulling in @types/jquery would add a large type surface for one call
 * site, and Summernote ships no types at all.
 */
declare module 'jquery';
declare module 'summernote/dist/summernote-lite.js';
declare module 'summernote/dist/summernote-lite.css';
