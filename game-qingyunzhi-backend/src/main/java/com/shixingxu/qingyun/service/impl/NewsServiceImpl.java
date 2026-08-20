package com.shixingxu.qingyun.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shixingxu.qingyun.entity.News;
import com.shixingxu.qingyun.mapper.NewsMapper;
import com.shixingxu.qingyun.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NewsServiceImpl implements NewsService {

    private final NewsMapper newsMapper;

    @Override
    public List<News> getLatestNews(int limit) {
        Page<News> page = new Page<>(1, limit);
        return newsMapper.selectPage(page, new LambdaQueryWrapper<News>()
                .eq(News::getStatus, 1)
                .orderByDesc(News::getPublishTime)
                .orderByDesc(News::getId))
                .getRecords();
    }

    @Override
    public News getById(Long id) {
        return newsMapper.selectById(id);
    }
}
