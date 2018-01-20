## GTFStools
current version 0.0.1

An R package that provides a set of tools for the use and manipulation of GTFS tables.

### current functions:    
    
**readGTFS** - reads multiple tables from csv or txt files and assignes them to the Global environment with a *GTFS* prefix.    
    
**segmentedLines** - creates SpatialLines objects from a selected route, the line is segmented between each of the route's stops.
* note - the lines location may seem distorted from the location of stops or streets, that is due to the shapes being provided by operators while the stops table is provided by the local transit authority.
    
**GTFSbyshp** - subset the GTFS tables by a polygon shapefile, the subsetted tables will include the data for the polygon's area.

### planned functions:
    
**GTFSbyOperator** - subset the GTFS tables to include only one operator.
