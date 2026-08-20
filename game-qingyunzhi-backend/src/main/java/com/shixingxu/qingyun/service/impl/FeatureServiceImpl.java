package com.shixingxu.qingyun.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.shixingxu.qingyun.entity.Feature;
import com.shixingxu.qingyun.mapper.FeatureMapper;
import com.shixingxu.qingyun.service.FeatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeatureServiceImpl implements FeatureService {

    private final FeatureMapper featureMapper;

    @Override
    public List<Feature> listOnline() {
        return featureMapper.selectList(new LambdaQueryWrapper<Feature>()
                .eq(Feature::getStatus, 1)
                .orderByAsc(Feature::getSort)
                .orderByAsc(Feature::getId));
    }
}
