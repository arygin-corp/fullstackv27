GDX ADMIN AUTH TEMPLATES

Copy these files to:
    templates/gdx_admin/auth/

Expected static structure:
    static/gdx_admin/css/bootstrap.min.css
    static/gdx_admin/css/iconsax.css
    static/gdx_admin/css/style.css
    static/gdx_admin/js/bootstrap.bundle.min.js
    static/gdx_admin/js/script.js
    static/gdx_admin/plugins/tabler-icons/tabler-icons.min.css
    static/gdx_admin/img/logo-large.svg
    static/gdx_admin/img/favicon.png
    static/gdx_admin/img/apple-touch-icon.png
    static/gdx_admin/img/auth/auth-cover.jpg
    static/gdx_admin/img/users/default-avatar.png

Expected URL names:
    gdx_admin:index
    login
    logout
    register
    password_reset
    lock_screen
    terms
    privacy

Notes:
1. If your URL names differ, update the {% url %} tags.
2. login.html expects Django's standard AuthenticationForm fields: username and password.
3. register.html renders the fields supplied by your registration form.
4. lock_screen.html expects a form with a password field.
5. The Remember Me checkbox requires server-side handling if you want it to change session expiry.
6. The registration_enabled context variable can hide the create-account prompt on login.
