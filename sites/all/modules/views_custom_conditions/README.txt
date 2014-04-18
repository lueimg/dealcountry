Module
-------
Views Custom Conditions


CREDITS
--------

This module was created by OSSCube Solutions Pvt Ltd <www dot osscube dot com>
Developed by Bhupendra Singh <bhupendra at osscube dot com>
Developed by Nirbhav Gupta <http://drupal.org/user/2416448>


DESCRIPTION
-------------

  This views_custom_conditions module facilitates the site administrator to inject
  where clause with existing fields into the views query.
  ‘Views’ is a powerful and highly flexible module
  that provides website builders with critical list making abilities.
  So, to implement custom where clause for views creation can be really helpful.


BENEFITS
---------

 # No need to write separate SQL query, users can do it in views
 # Easy to implement extra where conditions	  

                                                            	 
INSTALLATION
-------------

  # Download and copy module in modules folder.
  # Install the module.
  # It will generate(Views Custom Conditions) field in views Advance settings.
  # Fill suggestion in this field for adding new conditions for respective table,
    fields, desired matching value (it should be multiple) & conditions 
    like IN, OR, AND. Follow hint section under this field. 
    These items should be exists under exisiting views build query.
    You can get help from query printed under views.
  # This will inject the conditions in where clause of the views query.
  # Save the view for permanant changes.
  # It will be workable for a single view.
    If any views having multiple views then these settings will applicable for all views.


DEPENDENCY
----------
   "views_ui" module
   Downhload URL : http://drupal.org/project/views

