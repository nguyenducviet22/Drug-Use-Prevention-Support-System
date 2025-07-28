package com.swp.drug_use_prevention_support_system.services;

import com.swp.drug_use_prevention_support_system.domain.dtos.requests.CreateBlogRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.requests.UpdateBlogRequest;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.BlogResponse;
import com.swp.drug_use_prevention_support_system.domain.dtos.responses.UserResponse;
import com.swp.drug_use_prevention_support_system.domain.entities.Blog;
import com.swp.drug_use_prevention_support_system.domain.entities.User;
import com.swp.drug_use_prevention_support_system.domain.enums.AgeGroup;
import com.swp.drug_use_prevention_support_system.domain.enums.BlogStatus;
import com.swp.drug_use_prevention_support_system.domain.enums.Role;
import com.swp.drug_use_prevention_support_system.mappers.BlogMapper;
import com.swp.drug_use_prevention_support_system.repositories.BlogRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.YearMonth;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BlogServiceTest {

    @Mock
    private BlogRepository blogRepository;

    @Mock
    private BlogMapper blogMapper;

    @Mock
    private UserService userService;

    @InjectMocks
    private BlogService blogService;

    @Captor
    private ArgumentCaptor<Blog> blogCaptor;

    @Test
    void testCreateBlogWithValidData() {
        CreateBlogRequest request = CreateBlogRequest.builder()
                .blogName("Test Blog")
                .description("desc")
                .content("This is a test blog content with enough words for reading time calculation.")
                .blogType(null)
                .blogStatus(BlogStatus.PUBLISHED)
                .ageGroup(AgeGroup.ADULT)
                .build();
        Blog blogEntity = Blog.builder().blogStatus(BlogStatus.PUBLISHED).build();
        User user = User.builder().username("user1").build();
        BlogResponse response = BlogResponse.builder().blogName("Test Blog").member(UserResponse.builder().username("user1").build()).readingTime(1).build();

        when(blogMapper.toEntity(request)).thenReturn(blogEntity);
        when(userService.getLoginUsername()).thenReturn("user1");
        when(userService.getUserEntity("user1")).thenReturn(user);
        when(blogMapper.toDto(any(Blog.class))).thenReturn(response);

        BlogResponse result = blogService.createBlog(request);

        verify(blogRepository).save(blogCaptor.capture());
        Blog savedBlog = blogCaptor.getValue();
        assertEquals(user, savedBlog.getMember());
        assertEquals(1, savedBlog.getReadingTime());
        assertEquals(BlogStatus.PENDING, savedBlog.getBlogStatus());
        assertEquals("Test Blog", result.getBlogName());
        assertEquals("user1", result.getMember().getUsername());
    }

    @Test
    void testGetAllBlogsReturnsMappedResponses() {
        Blog blog1 = Blog.builder().blogID(UUID.randomUUID()).build();
        Blog blog2 = Blog.builder().blogID(UUID.randomUUID()).build();
        List<Blog> blogs = Arrays.asList(blog1, blog2);
        BlogResponse resp1 = BlogResponse.builder().blogID(blog1.getBlogID()).build();
        BlogResponse resp2 = BlogResponse.builder().blogID(blog2.getBlogID()).build();

        when(blogRepository.findAll()).thenReturn(blogs);
        when(blogMapper.toDto(blog1)).thenReturn(resp1);
        when(blogMapper.toDto(blog2)).thenReturn(resp2);

        List<BlogResponse> responses = blogService.getAllBlogs();

        assertEquals(2, responses.size());
        assertTrue(responses.stream().anyMatch(r -> r.getBlogID().equals(blog1.getBlogID())));
        assertTrue(responses.stream().anyMatch(r -> r.getBlogID().equals(blog2.getBlogID())));
    }

    @Test
    void testGetBlogWithNonExistentIdThrowsException() {
        UUID blogId = UUID.randomUUID();
        when(blogRepository.findById(blogId)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> blogService.getBlog(blogId));
    }

    @Test
    void testGetBlogsByStatusExceptRoleExcludesSpecifiedRole() {
        Role excludedRole = Role.CONSULTANT;
        Blog blog1 = Blog.builder().member(User.builder().role(Role.MEMBER).build()).build();
        Blog blog2 = Blog.builder().member(User.builder().role(Role.CONSULTANT).build()).build();
        List<Blog> blogs = Arrays.asList(blog1, blog2);
        BlogResponse resp1 = BlogResponse.builder().build();

        when(blogRepository.findByBlogStatusOrderByCreatedAtDesc(BlogStatus.PUBLISHED)).thenReturn(blogs);
        when(blogMapper.toDto(blog1)).thenReturn(resp1);

        List<BlogResponse> result = blogService.getBlogsByStatusExceptRole(BlogStatus.PUBLISHED, excludedRole);

        assertEquals(1, result.size());
        verify(blogMapper, times(1)).toDto(blog1);
        verify(blogMapper, never()).toDto(blog2);
    }

    @Test
    void testGetBlogsByAgeGroupIncludesEveryone() {
        Blog blog1 = Blog.builder().blogID(UUID.randomUUID()).build();
        Blog blog2 = Blog.builder().blogID(UUID.randomUUID()).build();
        List<Blog> ageGroupBlogs = Collections.singletonList(blog1);
        List<Blog> everyoneBlogs = Collections.singletonList(blog2);
        BlogResponse resp1 = BlogResponse.builder().blogID(blog1.getBlogID()).build();
        BlogResponse resp2 = BlogResponse.builder().blogID(blog2.getBlogID()).build();

        when(blogRepository.findByAgeGroupAndBlogStatusOrderByCreatedAtDesc(AgeGroup.ADOLESCENT, BlogStatus.PUBLISHED)).thenReturn(ageGroupBlogs);
        when(blogRepository.findByAgeGroupAndBlogStatusOrderByCreatedAtDesc(AgeGroup.EVERYONE, BlogStatus.PUBLISHED)).thenReturn(everyoneBlogs);
        when(blogMapper.toDto(blog1)).thenReturn(resp1);
        when(blogMapper.toDto(blog2)).thenReturn(resp2);

        List<BlogResponse> result = blogService.getBlogsByAgeGroup(AgeGroup.ADOLESCENT);

        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(r -> r.getBlogID().equals(blog1.getBlogID())));
        assertTrue(result.stream().anyMatch(r -> r.getBlogID().equals(blog2.getBlogID())));
    }

    @Test
    void testCalculateReadingTimeWithIrregularWhitespace() {
        String content = "   This   is   a   test   with   irregular   spacing.   ";
        int expectedWords = 8;
        int expectedReadingTime = (int) Math.ceil((double) expectedWords / 200);
        assertEquals(expectedReadingTime, blogService.calculateReadingTime(content));
    }

    @Test
    void testGetBlogStatsReturnsAccurateMetrics() {
        when(blogRepository.count()).thenReturn(100L);
        when(blogRepository.countByBlogStatus(BlogStatus.PENDING)).thenReturn(5L);

        YearMonth current = YearMonth.now();
        YearMonth last = current.minusMonths(1);

        when(blogRepository.countBlogsByMonth(current.getYear(), current.getMonthValue())).thenReturn(20);
        when(blogRepository.countBlogsByMonth(last.getYear(), last.getMonthValue())).thenReturn(10);

        Map<String, Object> stats = blogService.getBlogStats();

        assertEquals(100L, stats.get("totalBlogs"));
        assertEquals(5L, stats.get("pendingBlogs"));
        assertEquals(100L, stats.get("growthPercent")); // (20-10)/10*100 = 100
    }

    @Test
    void testGetBlogsByStatusAndRoleFiltersCorrectly() {
        BlogResponse resp1 = BlogResponse.builder().member(UserResponse.builder().role(Role.MEMBER).build()).build();
        BlogResponse resp2 = BlogResponse.builder().member(UserResponse.builder().role(Role.CONSULTANT).build()).build();
        List<BlogResponse> all = Arrays.asList(resp1, resp2);

        BlogService spyService = Mockito.spy(blogService);
        doReturn(all).when(spyService).getBlogsByStatus(BlogStatus.PUBLISHED);

        List<BlogResponse> result = spyService.getBlogsByStatusAndRole(BlogStatus.PUBLISHED, Role.MEMBER);

        assertEquals(1, result.size());
        assertEquals(Role.MEMBER, result.get(0).getMember().getRole());
    }

    @Test
    void testCreateBlogWithNonExistentUserThrowsException() {
        CreateBlogRequest request = CreateBlogRequest.builder()
                .blogStatus(BlogStatus.PUBLISHED)
                .content("Some content")
                .build();
        Blog blogEntity = Blog.builder().blogStatus(BlogStatus.PUBLISHED).build();

        when(blogMapper.toEntity(request)).thenReturn(blogEntity);
        when(userService.getLoginUsername()).thenReturn("nonexistent");
        when(userService.getUserEntity("nonexistent")).thenThrow(new EntityNotFoundException("User does not exist"));

        assertThrows(EntityNotFoundException.class, () -> blogService.createBlog(request));
    }

    @Test
    void testGetBlogsByStatusAndDateDurationReturnsCorrectBlogs() {
        Instant start = Instant.now().minusSeconds(3600);
        Instant end = Instant.now();
        Blog blog = Blog.builder().blogID(UUID.randomUUID()).build();
        BlogResponse resp = BlogResponse.builder().blogID(blog.getBlogID()).build();

        when(blogRepository.findByBlogStatusAndCreatedAtBetween(BlogStatus.PUBLISHED, start, end)).thenReturn(Collections.singletonList(blog));
        when(blogMapper.toDto(blog)).thenReturn(resp);

        List<BlogResponse> result = blogService.getBlogsByStatusAndDateDuration(BlogStatus.PUBLISHED, start, end);

        assertEquals(1, result.size());
        assertEquals(blog.getBlogID(), result.get(0).getBlogID());
    }

    @Test
    void testGetMyBlogsByStatusReturnsEmptyListWhenNoBlogs() {
        when(blogRepository.findByMemberUsernameAndBlogStatusOrderByCreatedAtDesc("user1", BlogStatus.DRAFT)).thenReturn(Collections.emptyList());
        List<BlogResponse> result = blogService.getMyBlogsByStatus("user1", BlogStatus.DRAFT);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testCreateBlogWithDraftStatusRemainsDraft() {
        CreateBlogRequest request = CreateBlogRequest.builder()
                .blogStatus(BlogStatus.DRAFT)
                .content("Draft content")
                .build();
        Blog blogEntity = Blog.builder().blogStatus(BlogStatus.DRAFT).build();
        User user = User.builder().username("user1").build();
        BlogResponse response = BlogResponse.builder().blogStatus(BlogStatus.DRAFT).member(UserResponse.builder().username("user1").build()).build();

        when(blogMapper.toEntity(request)).thenReturn(blogEntity);
        when(userService.getLoginUsername()).thenReturn("user1");
        when(userService.getUserEntity("user1")).thenReturn(user);
        when(blogMapper.toDto(any(Blog.class))).thenReturn(response);

        BlogResponse result = blogService.createBlog(request);

        verify(blogRepository).save(blogCaptor.capture());
        Blog savedBlog = blogCaptor.getValue();
        assertEquals(BlogStatus.DRAFT, savedBlog.getBlogStatus());
        assertEquals(BlogStatus.DRAFT, result.getBlogStatus());
    }
}