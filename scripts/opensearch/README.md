Reindex opensearch indices https://github.com/moreton-blue-software/embrace-v2/issues/1652

This script reconfigures opensearch index field mapping as defined in `reindex.config.json`

to run:

AWS_PROFILE=mb-jim node scripts/opensearch/reindex.mjs "-4z2bbl35sjexfmjimqumrkjzey-dev"

to run for specific index only:
AWS_PROFILE=mb-jim node scripts/opensearch/reindex.mjs "project-4z2bbl35sjexfmjimqumrkjzey-dev"

template requirements:

`GET _template/sort_insensitive`

- For case_insensitive search

```json
{
  "sort_insensitive": {
    "order": 0,
    "index_patterns": ["*"],
    "settings": {
      "index": {
        "analysis": {
          "normalizer": {
            "case_insensitive": {
              "filter": "lowercase"
            }
          }
        }
      }
    },
    "mappings": {
      "dynamic_templates": [
        {
          "strings": {
            "mapping": {
              "type": "text",
              "fields": {
                "keyword": {
                  "normalizer": "case_insensitive",
                  "ignore_above": 256,
                  "type": "keyword"
                }
              }
            },
            "match_mapping_type": "string"
          }
        }
      ]
    },
    "aliases": {}
  }
}
```

PUT \_template/all_floats

```json
{
  "index_patterns": ["*"],
  "mappings": {
    "dynamic_templates": [
      {
        "longs": {
          "match_mapping_type": "long",
          "mapping": {
            "type": "float"
          }
        }
      },
      {
        "floats": {
          "match_mapping_type": "double",
          "mapping": {
            "type": "float"
          }
        }
      }
    ]
  }
}
```
