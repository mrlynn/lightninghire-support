#!/bin/sh
# Create new directories
mkdir -p src/app/admin/articles/[id]/edit
mkdir -p src/app/admin/articles/[id]/delete
mkdir -p src/app/admin/articles/new
mkdir -p src/app/admin/categories/[id]/edit
mkdir -p src/app/admin/categories/[id]/delete
mkdir -p src/app/admin/categories/new

# Move admin page
mv src/app/\(admin\)/admin/page.js src/app/admin/

# Move articles pages
mv src/app/\(admin\)/articles/page.js src/app/admin/articles/
mv src/app/\(admin\)/articles/new/page.js src/app/admin/articles/new/
mv src/app/\(admin\)/articles/\[id\]/edit/page.js src/app/admin/articles/[id]/edit/
mv src/app/\(admin\)/articles/\[id\]/delete/page.js src/app/admin/articles/[id]/delete/

# Move categories pages
mv src/app/\(admin\)/categories/page.js src/app/admin/categories/
mv src/app/\(admin\)/categories/new/page.js src/app/admin/categories/new/
mv src/app/\(admin\)/categories/\[id\]/edit/page.js src/app/admin/categories/[id]/edit/
mv src/app/\(admin\)/categories/\[id\]/delete/page.js src/app/admin/categories/[id]/delete/

# Clean up empty directories
rm -rf src/app/\(admin\)
