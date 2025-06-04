package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateBlogRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateBlogRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.BlogResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Blog;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.BlogStatus;
import com.swp.drug_use_prevention_support_system.mappers.BlogMapper;
import com.swp.drug_use_prevention_support_system.repositories.BlogRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogRepository blogRepository;
    private final BlogMapper blogMapper;
    private final UserService userService;

    @PreAuthorize("hasAnyRole('MEMBER', 'CONSULTANT', 'STAFF')")
    public BlogResponse createBlog(CreateBlogRequest request) {
        Blog newBlog = blogMapper.toEntity(request);
        if (!newBlog.getBlogStatus().equals(BlogStatus.DRAFT)) {
            newBlog.setBlogStatus(BlogStatus.PENDING);
        }
        String loginUsername = userService.getLoginUsername();
        User loginUser = userService.getUserEntity(loginUsername);
        newBlog.setMember(loginUser);
        blogRepository.save(newBlog);
        return blogMapper.toDto(newBlog);
    }

    public List<BlogResponse> getAllBlogs() {
        List<Blog> blogs = blogRepository.findAll();
        return blogs.stream()
                .map(blog -> blogMapper.toDto(blog))
                .toList();
    }

    public BlogResponse getBlog(UUID blogID) {
        Blog blog = blogRepository.findById(blogID)
                .orElseThrow(() -> new EntityNotFoundException("Blog does not exist with ID: " + blogID));
        return blogMapper.toDto(blog);
    }

    @PostAuthorize("returnObject.member.username == authentication.name || hasRole('STAFF')")
    public BlogResponse updateBlog(UUID blogID, UpdateBlogRequest request) {
        Blog blog = blogMapper.toEntity(getBlog(blogID));
        blog.setBlogName(request.getBlogName());
        blog.setRate(request.getRate());
        blog.setImg(request.getImg());
        blog.setDescription(request.getDescription());
        blog.setBlogType(request.getBlogType());
        if (!blog.getBlogStatus().equals(BlogStatus.DRAFT)) {
            blog.setBlogStatus(BlogStatus.PENDING);
        }
        blogRepository.save(blog);
        return blogMapper.toDto(blog);
    }

    @PostAuthorize("returnObject.member.username == authentication.name || hasRole('STAFF')")
    public BlogResponse updateBlogStatus(UUID blogID, BlogStatus status) {
        Blog blog = blogMapper.toEntity(getBlog(blogID));
        blog.setBlogStatus(status);
        blogRepository.save(blog);
        return blogMapper.toDto(blog);
    }
}
