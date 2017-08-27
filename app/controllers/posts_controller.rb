class PostsController < ApplicationController

  def new
  	@post = Post.new
  end

  def show
    @post = Post.find(params[:id])
  end

  def create
  	@post = Post.new(post_params)
    @post.user = current_user

  	if @post.save
      redirect_to @post
    else
      render 'new'
    end
  end

	def destroy
		@post = Post.find(params[:id])
    @post.destroy

    redirect_to posts_path
	end

	def index
		@posts = Post.all
	end

  private
  	def post_params
  		params.require(:post).permit(:title, :text)
  	end
end
