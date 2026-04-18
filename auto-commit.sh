#!/bin/bash
# Gọi khi muốn commit: ./auto-commit.sh

generate_message() {
  local files
  files=$(git diff --name-only HEAD 2>/dev/null; git ls-files --others --exclude-standard)

  local has_api=false has_web=false has_migration=false has_config=false
  local api_features=() web_features=()

  while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    if [[ "$f" == api/* ]]; then
      has_api=true
      if [[ "$f" == *Controller* ]];  then api_features+=("$(basename "$f" Controller.cs)")
      elif [[ "$f" == *Migration* ]]; then has_migration=true
      elif [[ "$f" == *DbContext* ]]; then api_features+=("DbContext")
      fi
    fi
    if [[ "$f" == web/src/* ]]; then
      has_web=true
      if [[ "$f" == *apps/bible-study* ]]; then web_features+=("bible-study")
      elif [[ "$f" == *apps/bible* ]];     then web_features+=("bible")
      elif [[ "$f" == *apps/finance* ]];   then web_features+=("finance")
      elif [[ "$f" == *apps/journal* ]];   then web_features+=("journal")
      elif [[ "$f" == *apps/tasks* ]];     then web_features+=("tasks")
      elif [[ "$f" == *apps/health* ]];    then web_features+=("health")
      elif [[ "$f" == *apps/devotion* ]];  then web_features+=("devotion")
      elif [[ "$f" == *apps/planner* ]];   then web_features+=("planner")
      elif [[ "$f" == *sidebar* || "$f" == *MenuItems* ]]; then web_features+=("menu")
      elif [[ "$f" == *layout* ]];         then web_features+=("layout")
      elif [[ "$f" == *lib/* ]];           then web_features+=("lib")
      fi
    fi
    if [[ "$f" == *.env* || "$f" == *appsettings* || "$f" == *docker-compose* || "$f" == deploy.sh || "$f" == nginx/* || "$f" == *Dockerfile* ]]; then
      has_config=true
    fi
  done <<< "$files"

  mapfile -t api_features < <(printf '%s\n' "${api_features[@]}" | sort -u)
  mapfile -t web_features < <(printf '%s\n' "${web_features[@]}" | sort -u)

  local parts=()
  $has_migration && parts+=("add migration")
  $has_api && [ ${#api_features[@]} -gt 0 ] && parts+=("api: ${api_features[*]}") || ($has_api && parts+=("update api"))
  $has_web && [ ${#web_features[@]} -gt 0 ] && parts+=("ui: $(printf '%s ' "${web_features[@]}" | tr ' ' '\n' | sort -u | tr '\n' ' ' | sed 's/ $//')") || ($has_web && parts+=("update ui"))
  $has_config && parts+=("config/deploy")

  [ ${#parts[@]} -eq 0 ] && echo "chore: update" || echo "chore: $(IFS=', '; echo "${parts[*]}")"
}

if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo "Không có thay đổi để commit."
  exit 0
fi

MSG=$(generate_message)
echo "Message: $MSG"
git add -A && git commit -m "$MSG"
