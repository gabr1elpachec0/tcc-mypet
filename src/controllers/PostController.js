const { PrismaClient } = require('@prisma/client')
const formidable = require('formidable')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')


const prisma = new PrismaClient()

module.exports = {

    // Create

    async createPost(req, res) {
        var userId = req.session.userId
        // console.log(userId)

        var form_create_post = new formidable.IncomingForm()

        form_create_post.parse(req, async (err, fields, files) => {
            var oldpath = files.postPic.filepath
            var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex')
            var nomeimg = hash + '.' + files.postPic.mimetype.split('/')[1]
            var newpath = path.join(__dirname, '../../public/postPics/', nomeimg)
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err
            })
            const createPost = await prisma.post.create({
                data: {
                    userId: userId,
                    pic: nomeimg,
                    description: fields['postDescription'],
                }
            })
            // console.log(createPost)

            req.session.success_create_post = "Post criado com sucesso!"
            res.redirect('/blog')
        })
    },

    // Find all

    async getAllPosts(req, res) {
        if (req.session.loggedin == true) {
            var success_create_post;
            var success_comment;
            var userId = req.session.userId;

            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            });

            // var userName   = findUserById.name
            var userType   = findUserById.type
            var profilePic = findUserById.profilePic

            if (req.session.success_create_post) {
                success_create_post = req.session.success_create_post
                req.session.success_create_post = ""
            }
            
            if (req.session.success_comment) {
                success_comment = req.session.success_comment
                req.session.success_comment = ""
            }

            const findAllPosts = await prisma.post.findMany({
                include : {
                    postAuthor: true,
                    PostLikes: true
                }
            });

            const findAllLikes = await prisma.postLike.findMany();

            const findAllComments = await prisma.postComment.findMany();

            // console.log(findAllLikes)
            // console.log(findAllPosts)

            var counter = 0

            const findNotificationsByUserId = await prisma.notification.findMany({
                where: {
                    userId: userId
                }
            })

            findNotificationsByUserId.forEach(function (notification) {
                counter += 1
            })
            
            
            res.render('blog', { 
                posts: findAllPosts,
                likes: findAllLikes,
                comments: findAllComments,
                success_create_post: success_create_post, 
                userType: userType, 
                profilePic: profilePic, 
                success_comment: success_comment,
                userId: userId,
                counter: counter
            });
        } else {
            req.session.erro = "Realize o login para ter acesso a esse serviço!"
            res.redirect('/login')
        }
    },

    // Read My Posts

    async getMyPosts(req, res) {
        if (req.session.loggedin == true) {
            var userId = req.session.userId

            const findPostByUser = await prisma.post.findMany({
                where: {
                    userId: userId,
                },
                include: {
                    postAuthor: true,
                    PostLikes: true,
                }
            })

            const findAllLikes = await prisma.postLike.findMany();

            const findAllComments = await prisma.postComment.findMany()


            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            }); 

            
            var success_update_post
            var success_delete_post
            var userType = findUserById.type
            var profilePic = findUserById.profilePic


            if (req.session.success_update_post) {
                success_update_post = req.session.success_update_post
                req.session.success_update_post = ""
            }

            if (req.session.success_delete_post) {
                success_delete_post = req.session.success_delete_post
                req.session.success_delete_post = ""
            }

            var counter = 0

            const findNotificationsByUserId = await prisma.notification.findMany({
                where: {
                    userId: userId
                }
            })

            findNotificationsByUserId.forEach(function (notification) {
                counter += 1
            })

            res.render('minhasPublicacoes', { 
                posts: findPostByUser, 
                likes: findAllLikes,
                comments: findAllComments,
                success_delete_post: success_delete_post, 
                success_update_post: success_update_post, 
                userType: userType, 
                userId: userId,
                profilePic: profilePic, 
                counter: counter 
            })
        } else {
            req.session.erro = "Realize o login para ter acesso a esse serviço!"
            res.redirect('/login')
        }
    },

    // Create Post Form
    async createPostForm(req, res) {
        var userId = req.session.userId

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId 
            }
        })

        var userType   = findUserById.type
        var profilePic = findUserById.profilePic

        var counter = 0

        const findNotificationsByUserId = await prisma.notification.findMany({
            where: {
                userId: userId
            }
        })

        findNotificationsByUserId.forEach(function (notification) {
            counter += 1
        })

        res.render('adicionarPostagem', { userType: userType, profilePic: profilePic, counter: counter })
    },

    // Update Post Form
    async updatePostForm(req, res) {
        var postId = parseInt(req.params.id)
        var userId = req.session.userId

        const findPostById = await prisma.post.findUnique({
            where: {
                id: postId
            }
        })

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        var userType = findUserById.type
        var profilePic = findUserById.profilePic

        var counter = 0

        const findNotificationsByUserId = await prisma.notification.findMany({
            where: {
                userId: userId
            }
        })

        findNotificationsByUserId.forEach(function (notification) {
            counter += 1
        })

        res.render('editarPostagem', { post: [findPostById], userType: userType, profilePic: profilePic, counter: counter })
    },

    // Update Post

    async updatePost(req, res) {
        var postId = parseInt(req.params.id)

        var form_update_post = new formidable.IncomingForm()

        var userId = req.session.userId
        // console.log(userId)

        form_update_post.parse(req, async (err, fields, files) => {
            var oldpath = files.postPic.filepath
            var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex')
            var nomeimg = hash + '.' + files.postPic.mimetype.split('/')[1]
            var newpath = path.join(__dirname, '../../public/postPics/', nomeimg)
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err
            })
            const updatePost = await prisma.post.update({
                where: {
                    id: postId
                },
                data: {
                    userId: userId,
                    pic: nomeimg,
                    description: fields['postDescription'],
                }
            })
            // console.log(updatePost)

            req.session.success_update_post = "Post atualizado com sucesso!"
            res.redirect('/minhasPublicacoes')
        })
    },

    // Delete Post

    async deletePost(req, res) {
        var postId = parseInt(req.params.id)

        await prisma.postLike.deleteMany({
            where: {
                postId: postId
            }
        })

        await prisma.postComment.deleteMany({
            where: {
                postId: postId
            }
        })

        await prisma.post.delete({
            where: {
                id: postId
            }
        })
        req.session.success_delete_post = "Post excluído com sucesso!"
        res.redirect('/minhasPublicacoes')
    },

    // Comment Post
    async getCommentForm(req, res) {
        if (req.session.loggedin == true) {
            var userId = req.session.userId
            var postId = parseInt(req.params.id)

            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })

            var userType = findUserById.type
            var profilePic = findUserById.profilePic

            const findPostById = await prisma.post.findUnique({
                where: {
                    id: postId
                }
            })

            var counter = 0

            const findNotificationsByUserId = await prisma.notification.findMany({
                where: {
                    userId: userId
                }
            })

            findNotificationsByUserId.forEach(function (notification) {
                counter += 1
            })

            res.render('adicionarComentario', {
                posts: [findPostById],
                userType: userType,
                profilePic: profilePic,
                postId: postId,
                counter: counter
            })
        }
    },

    async comment(req, res) {
        if (req.session.loggedin == true) {
            var userId = req.session.userId
            var postId = parseInt(req.params.id)

            var form_comment = new formidable.IncomingForm()

            form_comment.parse(req, async(err, fields, files) => {
                await prisma.postComment.create({
                    data: {
                        postId: postId,
                        userId: userId,
                        description: fields['comment']
                    }
                })

                req.session.success_comment = "Comentário adicionado com sucesso!"
                res.redirect('/blog')
            })
        }
    },

    async getAllComments(req, res) {
        if (req.session.loggedin == true) {
            var userId = req.session.userId
            var postId = parseInt(req.params.id)

            const findUserById = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })

            var userType = findUserById.type
            var profilePic = findUserById.profilePic

            const findPostComments = await prisma.postComment.findMany({
                where: {
                   postId: postId 
                },
                include: {
                    commentAuthor: true
                }
            })

            var counter = 0

            const findNotificationsByUserId = await prisma.notification.findMany({
                where: {
                    userId: userId
                }
            })

            findNotificationsByUserId.forEach(function (notification) {
                counter += 1
            })

            res.render('comentarios', {
                comments: findPostComments,
                userType: userType,
                profilePic: profilePic,
                counter: counter
            })
        }
    },

    // Like posts
    async like(req, res) {
        if (req.session.loggedin == true) {
            var userId = req.session.userId
            var postId = parseInt(req.params.id)

            const findLike = await prisma.postLike.findFirst({
                where: {
                    postId: postId,
                    userId: userId
                }
            })
            // console.log(findLike)

            if (findLike) {
                const deleteLike = await prisma.postLike.delete({
                    where: {
                        id: findLike.id
                    }
                })
                // console.log("Publicação descurtida!")
            } else {
                const like = await prisma.postLike.create({
                    data: {
                        userId: userId,
                        postId: postId
                    }
                })
                // console.log("Publicação curtida!")
            }
            res.redirect('/blog')
        }
    },

    async getMyPostComments(req, res) {
        var userId = req.session.userId
        var success_update_comment
        var success_delete_comment


        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        var userType = findUserById.type
        var profilePic = findUserById.profilePic

        const findMyComments = await prisma.postComment.findMany({
            where: {
                userId: userId
            },
            include: {
                commentAuthor: true,
            }
        })

        if (req.session.success_update_comment){ 
            success_update_comment = req.session.success_update_comment
            req.session.success_update_comment = ""
        }

        if (req.session.success_delete_comment) {
            success_delete_comment = req.session.success_delete_comment
            req.session.success_delete_comment = ""
        }

        var counter = 0

        const findNotificationsByUserId = await prisma.notification.findMany({
            where: {
                userId: userId
            }
        })

        findNotificationsByUserId.forEach(function (notification) {
            counter += 1
        })

        res.render('meusComentarios', {
            userType: userType,
            profilePic: profilePic,
            counter: counter,
            comments: findMyComments,
            success_update_comment: success_update_comment,
            success_delete_comment: success_delete_comment
        })
    },

    async getUpdateCommentForm (req, res) {
        var userId = req.session.userId
        var commentId = req.params.id

        const findUserById = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        var userType = findUserById.type
        var profilePic = findUserById.profilePic

        var counter = 0

        const findNotificationsByUserId = await prisma.notification.findMany({
            where: {
                userId: userId
            }
        })

        findNotificationsByUserId.forEach(function (notification) {
            counter += 1
        })

        const findMyComment = await prisma.postComment.findUnique({
            where: {
                id: Number(commentId)
            }
        })

        res.render('editarComentario', {
            userType: userType,
            profilePic: profilePic,
            counter: counter,
            comment: findMyComment
        })
    },

    async updateComment(req, res) {
        var userId = req.session.userId
        var commentId = parseInt(req.params.id)

        var form_update_comment = new formidable.IncomingForm()

        form_update_comment.parse(req, async (err, fields, files) => {
            await prisma.postComment.update({
                where: {
                    id: commentId
                },
                data: {
                    description: fields['comment']
                }
            })

            req.session.success_update_comment = "Comentário atualizado com sucesso!"
            res.redirect('/myComments')
        })
    },
    
    async deleteComment(req, res) {
        var commentId = parseInt(req.params.id)

        await prisma.postComment.delete({
            where: {
                id: commentId
            }
        })
        
        req.session.success_delete_comment = "Comentário excluído com sucesso!"
        res.redirect('/myComments')
    }

}