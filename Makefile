BUILD_DIR := ./dist
PROD_REPO = ssh://cstephen@housuggest.org/~/CHWApp.git

# Deploy tasks

prod: build git-prod
	@ git tag -f production
	@ echo "Production deploy complete"

# Build tasks

build:
	@ find www/ -name ".DS_Store" -depth -exec rm {} \;
	@ cp -R www/ $(BUILD_DIR) && \
    rm -rf $(BUILD_DIR)/bower_components

# Sub-tasks

clean:
	@ rm -rf $(BUILD_DIR)

git-prod:
	@ cd $(BUILD_DIR) && \
	git init && \
	git remote add origin $(PROD_REPO)
	@ cd $(BUILD_DIR) && \
	git add -A && \
	git commit -m "Release" && \
	git push -f origin +master:refs/heads/master

.PHONY: install build clean deploy git-prod prod
