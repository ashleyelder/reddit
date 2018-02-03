class RenameImageUrlToLinkUrl < ActiveRecord::Migration[5.1]
  def change
    rename_column :posts, :image_url, :link_url
  end
end
