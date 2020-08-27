Additional application source dependencies can be included in this folder.
Add src_deps directory to the top level of the source zip and include the following child directories within as needed:

    - pip/
        - Include any additional source tarballs or wheels of Python libaries required by the application.
        - Optionally include an ordering.txt file containing a newline-separated list of file names in the order they should be installed.
        - Optionally include a requirements.txt file which will be supplied using the pip install -r option.
    
    - rpms/
        - Include any additional RPMs required by the application.
        - Optionally include an ordering.txt file containing a newline-separated list of file names in the order they should be installed.
    
    - init/
        - Wildcard folder containing any other source dependencies.
        - Requires an ordering.txt file. Each line in ordering.txt will be executed in Bash.

