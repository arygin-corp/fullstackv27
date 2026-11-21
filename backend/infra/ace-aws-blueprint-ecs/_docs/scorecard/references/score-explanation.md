# Well-Architected (WA) Scorecard Scoring Explanation

*Disclaimer:* All scoring is performed within the scope of the blueprint itself. This will account for only the considerations that are [applicable](#applicable) to the blueprint, and the applicable considerations will only be considered from within the scope of the blueprint.

> For example, while SEC 9 considers protection of data in transit we consider an API Gateway blueprint satisfied through use of SSL traffic. However, the protection of data in transit within the application's request to a different internal application is not considered within the API Gateway blueprint's scorecard. That would be considered within the App Team's holistic application.

## Scoring Syntax
The score is calculated with the number of [satisfied](#satisfied) WA pillar considerations (by blueprint) over the number of [applicable](#applicable) WA pillar considerations.

> <sup># Satisfied WA Pillar Considerations (by blueprint)</sup>&frasl;<sub># Applicable WA Pillar Considerations</sub>

Non-applicable considerations are removed from the total altogether to reduce noise from considerations that might be applicable in larger architectures, but not within the scoped infrastructure of this blueprint.

> For example, PERF 4 which specifies a performant selection of database framework may be applicable through the variables specified in an Aurora Serverless blueprint, but does not hold any meaning for a blueprint that creates an API Gateway. Thus it should be included in the scorecard for the Aurora Serverless blueprint, but should not count against the API Gateway blueprint.

### Why not use a percentage?
The score is intentionally left as a non-reduced fraction to provide context of the scope of the well-architected review that is applicable. By not converting the fraction to a percentage and not reducing the fraction, we are able to see at a glance not-only how well the blueprint aligns with the well-architected pillars, but also how many of the pillars are applicable and considered.

> For example, when looking at the following scores, one might assume that the former offers better coverage than the latter:
> 
> 75% vs 70%
> 
> However, when looking at the actual fractional representations, we see that the latter actually covers a wider range of considerations:
> 
> <sup>3</sup>&frasl;<sub>4</sub> vs <sup>21</sup>&frasl;<sub>30</sub>
>
> While not necessarilly better, we can understand that the scoring and coverage for larger architectures may be more reliant upon application team usage and we can more directly evaluate and compare similar architectures.

## Total Score
The total score is calculated by summing the number of [satisfied](#satisfied) WA pillar considerations (by blueprint) across all pillars and placing that over the sum of the number of [applicable](#applicable) WA pillar considerations across all pillars. This gives a holistic view of the blueprint's architectural alignment at a quick glance.

> For example, given the following scores:
> 
> * Operational Excellence: <sup>3</sup>&frasl;<sub>3</sub>
> * Security: <sup>8</sup>&frasl;<sub>8</sub>
> * Reliability: <sup>10</sup>&frasl;<sub>13</sub>
> * Performance Efficiency: <sup>5</sup>&frasl;<sub>5</sub>
> * Cost Optimization: <sup>3</sup>&frasl;<sub>4</sub>
> * Sustainability: <sup>0</sup>&frasl;<sub>0</sub>
> * [TMNA] Security Accretidation: <sup>3</sup>&frasl;<sub>3</sub>
> 
> The total score would evaluate to: 
> 
> <sup>32</sup>&frasl;<sub>35</sub>

## Applicable Considerations
The applicable considerations column displays the number of applicable WA pillar considerations over the number of total WA pillar considerations. This gives an indication of the amount of considerations that apply to the given blueprint and how many are removed from the scoring.

## Pillar Score
The pillar score is calculated by placing the number of satisfied considerations (by blueprint) over the number of applicable considerations. As outlined in the scoring, this allows a quick view of how well the blueprint aligns to this well-architected pillar while reducing noise from considerations that are not applicable to the given blueprint.

### Consideration Scoring
Within each consideration, the scoring is comprised of two parts: Applicable and Satisfied. To give additional explanations, a comments section is included as well.

#### Applicable
This section denotes whether the consideration applies to the given blueprint.

> Please note that while some considerations may not apply to a given blueprint, all considerations are applicable to the end application team and their application.

In the event that a consideration is not applicable, an explanation must be included in the comments section.

* :x: = Not Applicable
* :heavy_check_mark: = Applicable

#### Satisfied
This section denotes whether the consideration is satisfied within the given blueprint. Only considerations satisfied by the blueprint directly are included in final scoring.

An explanation for the provided designation must be included within the comments section. Additionally, designations that include the App Team must include specifically what is required from the App Team in order to satisfy the consideration within the scope of this architecture.

In the event that a consideration is satisfied, an explanation must be included in the comments section.

In the event that a consideration is not satisfied, an explanation of why the consideration is not satisfied must be included in the comments section.

* ![ACE](ace_avatar.png){width="30"} = By Blueprint
* ![App Team](app_avatar.png){width="30"} = By App Team
* ![ACE](ace_avatar.png){width="30"}![App Team](app_avatar.png){width="30"}= Requires Both Blueprint and App Team
* :x: = Not Satisfied

#### Comments
The comments section includes additional information to explain the reasoning behind Applicable and Satisfied designations. For more context regarding what information is expected to be contained within the comments section, please refer to the [Applicable](#applicable) and [Satisfied](#satisfied) sections of this documentation.
