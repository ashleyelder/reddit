require 'link_thumbnailer'
require 'httparty'

class PostsController < ApplicationController
  before_action :authenticate_logged_in, only: [:new_text, :new_link, :new_image, :create]
  before_action :authenticate_owner, only: [:destroy]
  before_action :find_post, only: [:show, :edit, :update, :destroy]
  before_action :set_page, only: [:index]

  def index
    @posts = Post.all.sort_by{|p| p.score_total}.reverse.drop((@page.to_i - 1)*posts_per_page).first(posts_per_page)
  end

  def new_image
    @post = Post.new
  end

  def new_link
  	@post = Post.new
  end

  def new_text
    @post = Post.new
  end

  def link_url
    @post.link_url = LinkThumbnailer.generate(@post.url).images.first.src.to_s
  end

  def vote
    Vote.create(user_id: @post.user_id, parent_type: "Post", parent_id: @post.id, score: 1)
  end

  def create_image
    @post = current_user.posts.build(post_params)
    upload_image
    if @post.save
      vote
      redirect_to @post
    else
      render 'new_image'
    end
  end

  def create_link
    @post = current_user.posts.build(post_params)
    link_url
    if @post.save
      vote
      redirect_to @post
    else
      render 'new_link'
    end
  end

  def create_text
    @post = current_user.posts.build(post_params)
    if @post.save
      vote
      redirect_to @post
    else
      render 'new_text'
    end
  end

  def destroy
    @post.destroy
    redirect_to posts_path
  end

  def update
    @post = Post.find(params[:id])
    @post.update(title: "deleted", text: "deleted", user: nil)
  end

  def upload_image
    file = @post.image.file.file
    binary_file = IO.read(file)
    response = HTTParty.post(
      "https://api.imgur.com/3/image",
      headers: {
        "Authorization" => "Client-ID cfc283968cd6131"
      },
      body: {
        image: binary_file
      }
    )
    httparty_json = JSON.parse(response.body)
    data = httparty_json["data"]
    @post.imgur_url = data["link"]
  end

  private
    def find_post
      @post = Post.find(params[:id])
    end

    def post_params
		  params.require(:post).permit(:title, :text, :vote, :url, :subreddit, :image_url, :image)
	  end

    def set_page
      @page = params[:page] || 1
    end

    def posts_per_page
      @posts_per_page = 25
    end

    def authenticate_logged_in
      unless current_user
        redirect_to signup_path
      end
    end

    def authenticate_owner
      @post = Post.find(params[:id])
      unless @post.user == current_user
        redirect_to post_path
      end
    end
end
