# DeTourist Category Taxonomy (Phase 1A)

This document outlines the standard category taxonomy used by DeTourist to classify Points of Interest (POIs).

During **Phase 1A (§8.4)**, the `CrowdIndex` heuristic will use these base categories to establish a baseline "attraction pull" or "density capacity" for each location before incorporating live data or historical mobility data.

## Taxonomy Structure

The taxonomy maps raw data (like OSM tags) into high-level Categories and specific Sub-categories. Each category is assigned a **CrowdIndex Base Multiplier**, representing its inherent capacity to draw and retain crowds (1.0 = baseline, >1.0 = high crowd density).

| High-Level Category      | Sub-categories                                                     | Mapped OSM Tags                                                                                                            | CrowdIndex Base Multiplier | Heuristic Rationale                                                                                          |
| :------------------------| :------------------------------------------------------------------| :--------------------------------------------------------------------------------------------------------------------------| :--------------------------| :------------------------------------------------------------------------------------------------------------|
| **Attractions**          | Museums, Galleries, Theme Parks, Zoos, Viewpoints                  | `tourism=museum`, `tourism=gallery`, `tourism=theme_park`, `tourism=zoo`, `tourism=viewpoint`                              | **1.5x**                   | High dwell time, dedicated tourist destinations. Prone to intense crowding at peak hours.                    |
| **Landmarks & Historic** | Monuments, Castles, Ruins, Archaeological Sites, Places of Worship | `historic=monument`, `historic=castle`, `historic=ruins`, `historic=archaeological_site`, `amenity=place_of_worship`       | **1.3x**                   | Strong tourist pull but often open-air or quick-photo stops, leading to moderate-to-high transient crowding. |
| **Food & Drink**         | Restaurants, Cafes, Bars, Pubs, Food Courts                        | `amenity=restaurant`, `amenity=cafe`, `amenity=bar`, `amenity=pub`, `amenity=food_court`                                   | **1.1x**                   | Highly variable based on time of day. High density but distributed across the city.                          |
| **Shopping**             | Markets, Malls, Souvenirs, Boutiques                               | `shop=mall`, `amenity=marketplace`, `shop=gift`, `shop=boutique`                                                           | **1.2x**                   | Markets (`amenity=marketplace`) can be extreme choke points for crowding, while malls handle density better. |
| **Parks & Nature**       | Parks, Nature Reserves, Beaches, Gardens                           | `leisure=park`, `leisure=nature_reserve`, `natural=beach`, `leisure=garden`                                                | **0.7x**                   | Large surface areas dilute crowd density. Very low baseline index, unless it's a specific narrow viewpoint.  |
| **Transit Hubs**         | Train Stations, Bus Stations, Airports                             | `building=train_station`, `amenity=bus_station`, `aeroway=terminal`                                                        | **1.6x**                   | Extreme baseline crowding due to commuter and tourist overlap. Bottleneck locations.                         |
| **Accommodation**        | Hotels, Hostels, Motels, Guest Houses                              | `tourism=hotel`, `tourism=hostel`, `tourism=motel`, `tourism=guest_house`                                                  | **0.8x**                   | Private spaces. Base crowd index is low since they are points of departure rather than daytime destinations. |

## Application in CrowdIndex Heuristic

In Phase 1A, the basic CrowdIndex for a given POI will be calculated as:

```python
Base_CrowdIndex = (Significance_Tier_Weight) * (Category_Base_Multiplier)
```

*Note: `Significance_Tier` (1-5) will act as a volumetric scaler (e.g., the Eiffel Tower is a Tier 5 Landmark, a local statue is a Tier 1 Landmark).*
